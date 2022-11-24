import Debug "mo:base/Debug";
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

actor FeedReader {

    type ItemHash = Nat32;

    type FeedItem = {
        channelId : Text;
        content : Content.Content;
    };

    type FeedItemWithHash = FeedItem and {
        hash: ItemHash;
    };

    type ChannelInfo = {
        owners : [Principal];
        publishers : [Principal];
        instance : Channel.ChannelActor;
    };

    type UserData = {
        var unread: List.List<ItemHash>;
        var saved: List.List<ItemHash>;
    };

    private stable var channels : Trie.Trie<Text, ChannelInfo> = Trie.empty();

    private stable var userData : Trie.Trie<Principal, UserData> = Trie.empty();

    private stable var itemMap : Trie.Trie<ItemHash, FeedItem> = Trie.empty();

    public shared ({ caller }) func channelCallback(update : Feed.CallbackArgs) : async Feed.CallbackResult {

        switch (update.message) {
            case (#newContent(c)) {
                // TODO validate caller
                let newItem : FeedItem = {
                    channelId = update.channelId;
                    content = c;
                };
                let hash: ItemHash = hashItem(newItem);
                let key = {
                    hash=hash;
                    key=hash;
                };
                let (newItemMap, currentItem) = Trie.put(itemMap, key, Nat32.equal, newItem);
                itemMap := newItemMap;
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

    private func hashItem(i : FeedItem) : ItemHash {
        Text.hash(i.channelId);
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

    type GetResult = {
        #ok: [FeedItemWithHash];
        #notRegistered;
    };

    public shared query ({ caller }) func getUnread(limit : Nat, afterItem : ?ItemHash) : async GetResult {
        
        get(#unread, caller, limit, afterItem);
    };

    public shared query ({ caller }) func getSaved(limit : Nat, afterItem : ?ItemHash) : async GetResult {
        
        get(#saved, caller, limit, afterItem);
    };

    private func get(t: {#unread;#saved}, caller: Principal, limit : Nat, afterItem : ?ItemHash) : GetResult {
        let userData = switch(getUserData(caller)) {
            case (null) return #notRegistered;
            case (?d) d;
        };
        var skipTillFoundHash : ?ItemHash = afterItem;
        let resultItems = Buffer.Buffer<FeedItemWithHash>(limit);
        let items = switch(t){
            case (#unread) userData.unread;
            case (#saved) userData.saved;
        };
        Iter.iterate<ItemHash>(
            Iter.fromList(items),
            func(itemHash, i) {
                switch (skipTillFoundHash) {
                    case (null) {
                        // Already found hash or no hash
                        let key = {hash=itemHash;key=itemHash};
                        switch(Trie.get(itemMap, key, Nat32.equal)){
                            case (?item) {
                                resultItems.add({item with hash=itemHash});
                            };
                            case (null)
                            {
                                // Skip adding item. Cant find it
                                let items = switch(t){
                                    case (#unread) {
                                        userData.unread:= List.filter<ItemHash>(userData.unread, func(i){ i == itemHash});
                                    };
                                    case (#saved) {
                                        userData.saved:= List.filter<ItemHash>(userData.saved, func(i){ i == itemHash});
                                        };
                                };
                            }
                        }
                    };
                    case (?h) {
                        if (itemHash == h) {
                            // Set to null to allow search
                            // but still exclude this item
                            skipTillFoundHash := null;
                        };
                        // Don't add to result because this item is excluded
                    };
                };
            },
        );
        return #ok(resultItems.toArray());
    };

    public shared ({ caller }) func markItemAsRead(hash : ItemHash) : async {#ok; #notRegistered} {
        let userData = switch(getUserData(caller)) {
            case (null) return #notRegistered;
            case (?d) d;
        };
        userData.unread := List.filter<ItemHash>(
            userData.unread,
            func(i) {
                i != hash;
            },
        );
        #ok();
    };

    public shared ({ caller }) func saveItemForLater(hash : ItemHash) : async {#ok; #notRegistered} {
        let userData = switch(getUserData(caller)) {
            case (null) return #notRegistered;
            case (?d) d;
        };
        userData.saved := List.append(userData.saved, ?(hash, null));
        #ok();
    };

    public shared ({ caller }) func deleteSavedItem(hash : ItemHash) : async {#ok; #notRegistered} {
        
        let userData = switch(getUserData(caller)) {
            case (null) return #notRegistered;
            case (?d) d;
        };
        userData.saved := List.filter<ItemHash>(
            userData.saved,
            func(i) {
                i != hash;
            },
        );
        #ok();
    };

    private func getUserData(caller: Principal) :?UserData {
        let key = {hash=Principal.hash(caller);key=caller};
        Trie.get(userData, key, Principal.equal);
    };
};
