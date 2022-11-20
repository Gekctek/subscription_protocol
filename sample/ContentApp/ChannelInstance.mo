import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Text "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Channel "../../src/Channel";
import Content "../../src/Content";
import Feed "../../src/Feed";

actor class ChannelInstance(channelId : Text, channelOwner : Principal) {

    private type Post = {
        title : Text;
        description : Text;
        body : Text;
        link : Text;
        imageLink : ?Text;
    };

    type Subscriber = {
        var callback : Feed.Callback; // TODO is the use case for multiple callbacks worth it or what can do as an alternative?
    };

    private stable var publishedPosts : List.List<Post> = List.nil<Post>();

    private stable var subscribers : Trie.Trie<Principal, Subscriber> = Trie.empty();

    public shared ({ caller }) func subscribe(callback : Feed.Callback, options : ?Channel.SubscriptionOptions) : async Channel.SubscribeResult {
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(caller);
            key = caller;
        };
        let newSubcriber : Subscriber = {
            var callback = callback;
        };
        // Add new subscriber
        let (newSubscribers, _) = Trie.put(subscribers, key, Principal.equal, newSubcriber);
        subscribers := newSubscribers;
        #ok;
    };

    public shared ({ caller }) func unsubscribe() : async Channel.UnsubscribeResult {
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(caller);
            key = caller;
        };
        // Remove subscriber
        let (newSubscribers, removedSub) = Trie.remove(subscribers, key, Principal.equal);

        switch (removedSub) {
            case (null) #notSubscribed;
            case (?s) {
                subscribers := newSubscribers;
                #ok;
            };
        };
    };

    public query func getSubscribers() : async [Principal] {
        return Trie.toArray<Principal, Subscriber, Principal>(subscribers, func(k, v) { k });
    };

    public func publish(post : Post) : async () {
        publishedPosts := List.push(post, publishedPosts);
        let content : Feed.CallbackArgs = {
            message = #newContent({
                title = post.title;
                link = post.link; // TODO
                authors = [];
                date = Time.now();
                description = post.description;
                imageLink = post.imageLink;
                language = ?"en-us";
            });
            channelId = channelId;
        };
        // TODO will this lock up the cansiter if there are a lot of subscribers?
        for ((key, subscriber) in Trie.iter(subscribers)) {
            // TODO check if subscriber is applicable to this content
            switch (await subscriber.callback(content)) {
                case (#accepted) {

                };
                case (#notAuthorized) {
                    // Remove invalid subscriptions
                    let (newSubs, removedSub) = Trie.remove(subscribers, { hash = Principal.hash(key); key = key }, Principal.equal);
                    subscribers := newSubs;
                };
            };
        };
    };
};
