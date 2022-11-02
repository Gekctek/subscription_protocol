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
        content : Content.Content;
    };

    type ChannelInfo = {
        ownerPublicKey : Blob;
        instance : Channel.ChannelActor;
    };

    private stable var channels : Trie.Trie<Feed.Source, ChannelInfo> = Trie.empty();

    private stable var feed : List.List<FeedItem> = List.nil();

    // TODO should there be a result, or just 'send message unsubscribe if invalid'
    // TODO also this should be a preprocess to avoid canister fees?

    public func channelCallback(update : Feed.CallbackArgs) : async () {
        let channelKey = buildSourceKey(update.source);
        let c : ?ChannelInfo = Trie.get<Feed.Source, ChannelInfo>(
            channels,
            channelKey,
            sourcesAreEqual,
        );
        let channel : ChannelInfo = switch (c) {
            case (null) return; // TODO?
            case (?channel) channel;
        };
        if (not isSignatureValid(update)) {
            return; // TODO?
        };
        switch (update.message) {
            case (#content(c)) {
                let item : FeedItem = {
                    title = c.title;
                    content = c.content;
                };
                feed := List.push(item, feed);
            };
            case (#changeOwnerKey(newKey)) {
                let newChannel : ChannelInfo = {
                    channel with ownerPublicKey = newKey.publicKey;
                };
                let (newChannels, _) = Trie.put(channels, channelKey, sourcesAreEqual, newChannel);
                channels := newChannels;
            };
            case (#changeSource(newSource)) {
                // Remove old channel key
                let (filteredChannels, _) = Trie.remove(channels, channelKey, sourcesAreEqual);

                // Add new channel key
                let newChannelKey = buildSourceKey(newSource);
                let (newChannels, newChannel) = Trie.put(filteredChannels, newChannelKey, sourcesAreEqual, channel);
                if (newChannel != null) {
                    return; // TODO this shouldnt happen
                };
                channels := newChannels;
            };
        };
    };

    private func sourcesAreEqual(x : Feed.Source, y : Feed.Source) : Bool {
        x == y;
    };

    private func buildSourceKey(s : Feed.Source) : Trie.Key<Feed.Source> {
        {
            hash = hashSource(s);
            key = s;
        };
    };

    private func hashSource(s : Feed.Source) : Nat32 {
        let sourceText = Principal.toText(s.registry) # ":" # s.appId # ":" # s.channelId; // TODO better format?
        Text.hash(sourceText);
    };

    private func isSignatureValid(update : Feed.CallbackArgs) : Bool {
        // TODO
        true;
    };

    type AddChannelResult = {
        #ok;
        #channelNotFound;
    };

    public func subscribeToChannel(source : Feed.Source, options : ?Channel.SubscriptionOptions) : async AddChannelResult {
        let appRegistry : App.RegistryActor = actor (Principal.toText(source.registry));
        let channelInfo = switch (await appRegistry.getChannelInfo(source.appId, source.channelId)) {
            case (#notFound) return #channelNotFound;
            case (#ok(info)) info;
        };
        let channelInstance : Channel.ChannelActor = channelInfo.instance;

        switch (await channelInstance.subscribe(channelCallback, options)) {
            case (#ok) {
                let channelKey = buildSourceKey(source);
                let (newChannels, oldChannel) = Trie.put(channels, channelKey, sourcesAreEqual, channelInfo);
                if (oldChannel != null) {
                    return; // TODO
                };
                channels := newChannels;
                #ok;
            };
            case (#channelNotFound) #channelNotFound;
        };
    };

    public func getFeed() : async [FeedItem] {
        List.toArray(feed);
    };
};
