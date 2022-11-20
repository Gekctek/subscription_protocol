import Nat32 "mo:base/Nat32";
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
import TrieSet "mo:base/TrieSet";
import CandidValue "mo:candid/Value";

actor class FeedInstance(_owner : Principal) {

    type ItemId = Nat32;

    type FeedItem = {
        id : ItemId; // TODO this vs hash?
        channelId : Text;
        content : Content.Content;
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

    private stable var unread : List.List<ItemId> = List.nil();

    private stable var savedForLater : List.List<ItemId> = List.nil();

    private stable var itemHashTree : Trie.Trie<ItemId, FeedItem> = Trie.empty();

    private stable var nextId : ItemId = 0;

    private stable var owner : Principal = _owner;

    public shared ({ caller }) func channelCallback(update : Feed.CallbackArgs) : async Feed.CallbackResult {

        switch (update.message) {
            case (#newContent(c)) {
                let newItem : FeedItem = {
                    id = nextId;
                    channelId = update.channelId;
                    content = c;
                };
                let key = {
                    hash = nextId;
                    key = nextId;
                };
                let (newItemHashTree, _) = Trie.put<ItemId, FeedItem>(itemHashTree, key, Nat32.equal, newItem);
                itemHashTree := newItemHashTree;
                unread := List.push(nextId, unread);
                nextId += 1;
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

    public query func getUnread(limit : Nat, afterItem : ?ItemId) : async [FeedItem] {
        var skipTillFoundId : ?ItemId = afterItem;
        let resultItems = Buffer.Buffer<FeedItem>(limit);
        Iter.iterate<ItemId>(
            Iter.fromList(unread),
            func(itemHash, i) {
                switch (skipTillFoundId) {
                    case (null) {
                        // Already found hash or no hash
                    };
                    case (?a) {
                        if (itemHash == a) {
                            // Set to null to allow search
                            // but still exclude this item
                            skipTillFoundId := null;
                        };
                        // Skip to next item
                        return;
                    };
                };
                let key = {
                    hash = itemHash;
                    key = itemHash;
                };
                let item : ?FeedItem = Trie.get(itemHashTree, key, Nat32.equal);
                switch (item) {
                    case (?i) {
                        resultItems.add(i);
                    };
                    case (null) {
                        // TODO will this case issues in the loop?
                        unread := List.drop(unread, i);
                    };
                };
            },
        );
        return resultItems.toArray();
    };

    public func markItemAsRead(id : ItemId) : async () {
        let key = {
            hash = id;
            key = id;
        };
        if (Trie.get(itemHashTree, key, Nat32.equal) == null) {
            // Skip if already removed
            return;
        };
        unread := List.filter<ItemId>(
            unread,
            func(i) {
                i != id;
            },
        );
        let isSaved = List.some<ItemId>(savedForLater, func(i) { i == id });
        if (not isSaved) {
            let (newItemHashTree, _) = Trie.remove(itemHashTree, key, Nat32.equal);
            itemHashTree := newItemHashTree;
        };
    };

    public func saveItemForLater(id : ItemId) : async () {
        let key = {
            hash = id;
            key = id;
        };
        if (Trie.get(itemHashTree, key, Nat32.equal) == null) {
            // Skip if already removed
            return;
        };
        savedForLater := List.push(id, savedForLater);
    };
};
