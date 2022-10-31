import Channel "../../src/Channel";
import Content "../../src/Content";
import Feed "../../src/Feed";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import TrieSet "mo:base/TrieSet";
import AppRegistry "canister:AppRegistry";

actor class FeedInstance() {

    type FeedItem = {
        title : Text;
        content : Content.Content;
    };

    private stable var subscribedChannelPublicKeys : TrieSet.Set<Blob> = TrieSet.empty();

    private stable var feed : List.List<FeedItem> = List.nil();

    // TODO should there be a result, or just 'send message unsubscribe if invalid'
    // TODO also this should be a preprocess to avoid canister fees?

    public func channelCallback(update : Feed.CallbackArgs) : async () {
        let publicKeyHash = Blob.hash(update.channelPublicKey);
        let isValidChannel = TrieSet.mem(subscribedChannelPublicKeys, update.channelPublicKey, publicKeyHash, Blob.equal);
        if (not isValidChannel) {
            return; // TODO?
        };
        if (not isSignatureValid(update)) {
            return; // TODO?
        };
        let item : FeedItem = {
            title = update.title;
            content = update.content;
        };
        feed := List.push(item, feed);
    };

    private func isSignatureValid(update : Feed.CallbackArgs) : Bool {
        // TODO
        true;
    };

    type AddChannelResult = {
        #ok;
        #channelNotFound;
    };

    public func subscribeToChannel(appId : Text, channelId : Text, options : ?Channel.SubscriptionOptions) : async AddChannelResult {
        let channelInfo = switch (await AppRegistry.getChannelInfo(appId, channelId)) {
            case (#notFound) return #channelNotFound;
            case (#ok(info)) info;
        };
        let channelInstance : Channel.ChannelActor = channelInfo.instance;

        switch (await channelInstance.subscribe(channelCallback, options)) {
            case (#ok) {
                let publicKeyHash = Blob.hash(channelInfo.publicKey);
                subscribedChannelPublicKeys := TrieSet.put(subscribedChannelPublicKeys, channelInfo.publicKey, publicKeyHash, Blob.equal);
                #ok;
            };
            case (#channelNotFound) #channelNotFound;
        };
    };

    public func getFeed() : async [FeedItem] {
        List.toArray(feed);
    };
};
