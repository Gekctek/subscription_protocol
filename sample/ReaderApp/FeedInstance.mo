import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";
import Channel "../../src/Channel";
import Content "../../src/Content";
import Feed "../../src/Feed";
import App "../../src/App";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Trie "mo:base/Trie";

actor class FeedInstance() {

    type FeedItem = {
        title : Text;
        content : ?Content.Content;
        link : Text;
        hash : Hash.Hash;
    };

    type ChannelInfo = {
        ownerPublicKey : Blob;
        source : Source;
        instance : Channel.ChannelActor;
    };

    type Source = {
        registry : Principal;
        appId : Text;
        channelId : Text;
    };

    type ChannelPublicKey = Blob;

    private stable var channels : Trie.Trie<ChannelPublicKey, ChannelInfo> = Trie.empty();

    private stable var feed : List.List<FeedItem> = List.nil();

    // TODO should there be a result, or just 'send message unsubscribe if invalid'
    // TODO also this should be a preprocess to avoid canister fees?

    public func channelCallback(update : Feed.CallbackArgs) : async () {
        let channelKey = buildSourceKey(update.publicKey);
        let c : ?ChannelInfo = Trie.get<ChannelPublicKey, ChannelInfo>(
            channels,
            channelKey,
            Blob.equal,
        );
        let channel : ChannelInfo = switch (c) {
            case (null) return; // TODO?
            case (?channel) channel;
        };
        if (not isSignatureValid(update)) {
            return; // TODO?
        };
        switch (update.message) {
            case (#newContent(c)) {
                let item : FeedItem = {
                    title = c.title;
                    content = c.content;
                    link = c.link;
                    hash = 0; //TODO
                };
                feed := List.push(item, feed);
            };
            case (#changeOwnerKey(newKey)) {
                let newChannel : ChannelInfo = {
                    ownerPublicKey = newKey.publicKey;
                    instance = channel.instance;
                    source = channel.source;
                };
                let (newChannels, _) = Trie.put(channels, channelKey, Blob.equal, newChannel);
                channels := newChannels;
            };
        };
    };

    private func buildSourceKey(s : ChannelPublicKey) : Trie.Key<ChannelPublicKey> {
        {
            hash = Blob.hash(s);
            key = s;
        };
    };

    private func isSignatureValid(update : Feed.CallbackArgs) : Bool {
        // TODO
        true;
    };

    type AddChannelResult = {
        #ok;
        #channelNotFound;
    };

    public func subscribeToChannel(source : Source, options : ?Channel.SubscriptionOptions) : async AddChannelResult {
        let appRegistry : App.RegistryActor = actor (Principal.toText(source.registry));
        let appChannelInfo : App.ChannelInfo = switch (await appRegistry.getChannelInfo(source.appId, source.channelId)) {
            case (#notFound) return #channelNotFound;
            case (#ok(info)) info;
        };
        let channelInstance : Channel.ChannelActor = actor (Principal.toText(appChannelInfo.instance));

        let publicKey = Blob.fromArray([]); // TODO
        let signature = Blob.fromArray([]); // TODO
        switch (await channelInstance.subscribe(channelCallback, publicKey, signature, options)) {
            case (#ok) {
                let channelKey = buildSourceKey(publicKey);
                let (newChannels, _) = Trie.put(
                    channels,
                    channelKey,
                    Blob.equal,
                    {
                        ownerPublicKey = publicKey;
                        source = source;
                        instance = channelInstance;
                    },
                );
                channels := newChannels;
                #ok;
            };
        };
    };

    public func getFeed(limit : Nat, after : ?Hash.Hash) : async [FeedItem] {
        let l : List.List<FeedItem> = switch (after) {
            case (null) feed;
            case (?afterHash) {
                // If specified `after` then search for the item hash and
                // get items starting after the specified one
                var itemFound = false;
                let itemsAfter = Buffer.Buffer<FeedItem>(limit);
                label afterLoop for (i in Iter.fromList(feed)) {
                    if (i.hash == afterHash) {
                        itemFound := true;
                    };
                    if (itemFound) {
                        itemsAfter.add(i);
                        if (itemsAfter.size() >= limit) {
                            break afterLoop;
                        };
                    };
                };
                if (itemFound) {
                    return itemsAfter.toArray();
                } else {
                    // If item is not found then return normal feed
                    // Usually due to item being removed from feed after reading
                    feed;
                };
            };
        };
        return List.toArray(List.take(l, limit));
    };
};
