import Debug "mo:base/Debug";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";
import Subscription "../../src/Subscription";
import Content "../../src/Content";
import App "../../src/App";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Trie "mo:base/Trie";
import TrieSet "mo:base/TrieSet";
import CandidValue "mo:candid/Value";

// actor class FeedInstance(_owner : Principal) {

//     type ItemId = Nat32;

//     type FeedItem = {
//         channelId : Text;
//         content : Content.Content;
//     };

//     type FeedItemWithId = FeedItem and {
//         id : ItemId; // TODO this vs hash?
//     };

//     type ChannelInfo = {
//         owners : [Principal];
//         publishers : [Principal];
//         instance : Subscription.Actor;
//     };

//     // TODO
//     // type Source = {
//     //     registry : Principal;
//     //     appId : Text;
//     //     channelId : Text;
//     // };

//     private stable var channels : Trie.Trie<Text, ChannelInfo> = Trie.empty();

//     private stable var unread : List.List<FeedItemWithId> = List.nil();

//     private stable var savedForLater : List.List<FeedItemWithId> = List.nil();

//     private stable var nextUnreadId : ItemId = 0;

//     private stable var nextSavedId : ItemId = 0;

//     private stable var owner : Principal = _owner;

//     public shared ({ caller }) func channelCallback(update : Feed.CallbackArgs) : async Feed.CallbackResult {

//         switch (update.message) {
//             case (#newContent(c)) {
//                 // TODO validate caller
//                 let newItem : FeedItemWithId = {
//                     id = nextUnreadId;
//                     channelId = update.channelId;
//                     content = c;
//                 };
//                 unread := List.push(newItem, unread);
//                 nextUnreadId += 1;
//             };
//             case (#changeOwner(newOwner)) {
//                 let channel : ChannelInfo = switch (validateCaller(caller, update.channelId)) {
//                     case (#channel(c)) c;
//                     case (#channelNotFound) return #notAuthorized;
//                     case (#notAuthorized) return #notAuthorized;
//                 };
//                 let channelKey = {
//                     hash = Text.hash(update.channelId);
//                     key = update.channelId;
//                 };
//                 let newChannel = { channel with owner = newOwner };
//                 let (newChannels, _) = Trie.put(channels, channelKey, Text.equal, newChannel);
//                 channels := newChannels;
//             };
//         };
//         #accepted;
//     };

//     private func validateCaller(caller : Principal, channelId : Text) : {
//         #channel : ChannelInfo;
//         #channelNotFound;
//         #notAuthorized;
//     } {

//         let c : ?ChannelInfo = Trie.get<Text, ChannelInfo>(
//             channels,
//             {
//                 hash = Text.hash(channelId);
//                 key = channelId;
//             },
//             Text.equal,
//         );
//         switch (c) {
//             case (null) #channelNotFound;
//             case (?channel) {
//                 if (Array.find<Principal>(channel.publishers, func(p) { p == caller }) == null) {
//                     // #notAuthorized; TODO
//                     #channel(channel);
//                 } else {
//                     #channel(channel);
//                 };
//             };
//         };
//     };

//     type AddChannelResult = {
//         #ok;
//         #channelNotFound;
//     };

//     // public func subscribeToChannel(source : Source, options : ?Channel.SubscriptionOptions) : async AddChannelResult {
//     //     let appRegistry : App.RegistryActor = actor (Principal.toText(source.registry));
//     //     let appChannelInfo : App.ChannelInfo = switch (await appRegistry.getChannelInfo(source.appId, source.channelId)) {
//     //         case (#notFound) return #channelNotFound;
//     //         case (#ok(info)) info;
//     //     };
//     //     let channelInstance : Channel.ChannelActor = actor (Principal.toText(appChannelInfo.instance));

//     //     switch (await channelInstance.subscribe(channelCallback, options)) {
//     //         case (#ok) {
//     //             let channelKey = buildSourceKey(publicKey);
//     //             let (newChannels, _) = Trie.put(
//     //                 channels,
//     //                 channelKey,
//     //                 Blob.equal,
//     //                 {
//     //                     ownerPublicKey = publicKey;
//     //                     source = source;
//     //                     instance = channelInstance;
//     //                 },
//     //             );
//     //             channels := newChannels;
//     //             #ok;
//     //         };
//     //     };
//     // };

//     public shared query ({ caller }) func getUnread(limit : Nat, afterItem : ?ItemId) : async [FeedItemWithId] {
//         assert (caller == owner);
//         get(unread, limit, afterItem);
//     };

//     public shared query ({ caller }) func getSaved(limit : Nat, afterItem : ?ItemId) : async [FeedItemWithId] {
//         assert (caller == owner);
//         get(savedForLater, limit, afterItem);
//     };

//     private func get(items : List.List<FeedItemWithId>, limit : Nat, afterItem : ?ItemId) : [FeedItemWithId] {

//         var skipTillFoundId : ?ItemId = afterItem;
//         let resultItems = Buffer.Buffer<FeedItemWithId>(limit);
//         Iter.iterate<FeedItemWithId>(
//             Iter.fromList(items),
//             func(item, i) {
//                 switch (skipTillFoundId) {
//                     case (null) {
//                         // Already found hash or no hash
//                         resultItems.add(item);
//                     };
//                     case (?id) {
//                         if (item.id == id) {
//                             // Set to null to allow search
//                             // but still exclude this item
//                             skipTillFoundId := null;
//                         };
//                         // Don't add to result because this item is excluded
//                     };
//                 };
//             },
//         );
//         return resultItems.toArray();
//     };

//     public shared ({ caller }) func markItemAsRead(id : ItemId) : async () {
//         assert (caller == owner);
//         unread := List.filter<FeedItemWithId>(
//             unread,
//             func(i) {
//                 i.id != id;
//             },
//         );
//     };

//     public shared ({ caller }) func saveItemForLater(item : FeedItem) : async {
//         #ok : ItemId;
//     } {
//         assert (caller == owner);
//         let newSavedItem = { item with id = nextSavedId };
//         savedForLater := List.append(savedForLater, ?(newSavedItem, null));
//         nextSavedId += 1;
//         #ok(newSavedItem.id);
//     };

//     public shared ({ caller }) func deleteSavedItem(id : ItemId) : async { #ok } {
//         assert (caller == owner);
//         savedForLater := List.filter<FeedItemWithId>(
//             savedForLater,
//             func(i) {
//                 i.id != id;
//             },
//         );
//         #ok();
//     };
// };
