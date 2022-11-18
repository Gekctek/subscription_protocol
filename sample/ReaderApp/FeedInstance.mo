import Array "mo:base/Array";
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

actor class FeedInstance(_owner : Principal) {

    type FeedItem = {
        channelId : Text;
        content : Content.Content;
        hash : Hash.Hash;
    };

    type ChannelInfo = {
        owners : [Principal];
        publishers : [Principal];
        instance : Channel.ChannelActor;
    };

    // TODO
    // type Source = {
    //     registry : Principal;
    //     appId : Text;
    //     channelId : Text;
    // };

    private stable var channels : Trie.Trie<Text, ChannelInfo> = Trie.empty();

    private stable var feed : List.List<FeedItem> = List.nil();

    private stable var owner : Principal = _owner;

    public shared ({ caller }) func channelCallback(update : Feed.CallbackArgs) : async Feed.CallbackResult {

        switch (update.message) {
            case (#newContent(c)) {
                let newItemInfo = {
                    channelId = update.channelId;
                    content = c;
                };
                let hash : Nat32 = 0; // TODO
                let newItem : FeedItem = { newItemInfo with hash = hash };
                feed := List.push(newItem, feed);
            };
            case (#changeOwner(newOwner)) {
                let channel : ChannelInfo = switch (validateCaller(caller, update.channelId)) {
                    case (#channel(c)) c;
                    case (#channelNotFound) return #notAuthorized;
                    case (#notAuthorized) return #notAuthorized;
                };
                let channelKey = {
                    hash = Text.hash(update.channelId);
                    key = update.channelId;
                };
                let newChannel = { channel with owner = newOwner };
                let (newChannels, _) = Trie.put(channels, channelKey, Text.equal, newChannel);
                channels := newChannels;
            };
        };
        #accepted;
    };

    private func validateCaller(caller : Principal, channelId : Text) : {
        #channel : ChannelInfo;
        #channelNotFound;
        #notAuthorized;
    } {

        let c : ?ChannelInfo = Trie.get<Text, ChannelInfo>(
            channels,
            {
                hash = Text.hash(channelId);
                key = channelId;
            },
            Text.equal,
        );
        switch (c) {
            case (null) #channelNotFound;
            case (?channel) {
                if (Array.find<Principal>(channel.publishers, func(p) { p == caller }) == null) {
                    // #notAuthorized; TODO
                    #channel(channel);
                } else {
                    #channel(channel);
                };
            };
        };
    };

    type AddChannelResult = {
        #ok;
        #channelNotFound;
    };

    // public func subscribeToChannel(source : Source, options : ?Channel.SubscriptionOptions) : async AddChannelResult {
    //     let appRegistry : App.RegistryActor = actor (Principal.toText(source.registry));
    //     let appChannelInfo : App.ChannelInfo = switch (await appRegistry.getChannelInfo(source.appId, source.channelId)) {
    //         case (#notFound) return #channelNotFound;
    //         case (#ok(info)) info;
    //     };
    //     let channelInstance : Channel.ChannelActor = actor (Principal.toText(appChannelInfo.instance));

    //     switch (await channelInstance.subscribe(channelCallback, options)) {
    //         case (#ok) {
    //             let channelKey = buildSourceKey(publicKey);
    //             let (newChannels, _) = Trie.put(
    //                 channels,
    //                 channelKey,
    //                 Blob.equal,
    //                 {
    //                     ownerPublicKey = publicKey;
    //                     source = source;
    //                     instance = channelInstance;
    //                 },
    //             );
    //             channels := newChannels;
    //             #ok;
    //         };
    //     };
    // };

    public query func getFeed(limit : Nat, after : ?Hash.Hash) : async [FeedItem] {
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
