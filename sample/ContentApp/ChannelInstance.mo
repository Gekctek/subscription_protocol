import Text "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Channel "../../src/Channel";
import Content "../../src/Content";
import Feed "../../src/Feed";

actor class ChannelInstance() {

    private type Post = {
        title : Text;
        body : Text;
    };

    type FeedInfo = {
        id : Text;
        callback : Feed.Callback;
    };

    type Subscriber = {
        var feeds : Trie.Trie<Text, FeedInfo>;
        publicKey : Blob;
    };

    private stable var publishedPosts : List.List<Post> = List.nil<Post>();

    private stable var subscribers : Trie.Trie<Blob, Subscriber> = Trie.empty();

    public func subscribe(feedId : Text, callback : Feed.Callback, publicKey : Blob, signature : Blob) : async Channel.SubscribeResult {
        // TODO validate signature
        let key : Trie.Key<Blob> = {
            hash = Blob.hash(publicKey);
            key = publicKey;
        };
        let feed : FeedInfo = {
            id = feedId;
            callback = callback;
        };
        let newSubcriber : Subscriber = {
            var feeds = Trie.empty();
            publicKey = publicKey;
        };
        let (newSubscribers, currentSub) = Trie.put(subscribers, key, Blob.equal, newSubcriber);
        switch (currentSub) {
            case (null) {
                // Add new subscriber
                subscribers := newSubscribers;
            };
            case (?s) {
                // add/update feed in collection if there is already subscriber data
                let feedKey = {
                    hash = Text.hash(feedId);
                    key = feedId;
                };
                let (newFeeds, _) = Trie.put(s.feeds, feedKey, Text.equal, feed);
                s.feeds := newFeeds;
            };
        };
        #ok;
    };

    public func unsubscribe(publicKey : Blob, signature : Blob) : async Channel.UnsubscribeResult {
        // TODO
        #ok;
    };

    public func publish(post : Post) : async () {
        publishedPosts := List.push(post, publishedPosts);
        let content : Feed.CallbackArgs = {
            message = #content({
                title = post.title;
                content = #text(#raw(post.body));
            });
            channelId = {
                appId = ""; // TODO
                channelId = ""; // TODO
            };
            publicKey = Blob.fromArray([]); // TODO
            signature = Blob.fromArray([]); // TODO
        };
        for ((key, subscriber) in Trie.iter(subscribers)) {
            for ((feedId, feed) in Trie.iter(subscriber.feeds)) {
                await feed.callback(content);
            };
        };
    };
};
