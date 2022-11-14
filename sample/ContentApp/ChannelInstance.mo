import Text "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Channel "../../src/Channel";
import Content "../../src/Content";
import Feed "../../src/Feed";

actor class ChannelInstance(channelOwner : Principal) {

    private type Post = {
        title : Text;
        body : Text;
    };

    type Subscriber = {
        var callback : Feed.Callback; // TODO is the use case for multiple callbacks worth it or what can do as an alternative?
    };

    type Auth = {
        hashType : Text; // TODO text vs variant?
        publicKey : Blob; // Actual public key of the owner
        delegationChain : ?[Feed.SignedDelegation]; // Last one here ultimately signs the message
        signature : Blob; // Der encoded
    };

    private stable var publishedPosts : List.List<Post> = List.nil<Post>();

    private stable var subscribers : Trie.Trie<Blob, Subscriber> = Trie.empty();

    public func subscribe(callback : Feed.Callback, auth : Auth, options : ?Channel.SubscriptionOptions) : async Channel.SubscribeResult {
        // TODO validate signature
        let key : Trie.Key<Blob> = {
            hash = Blob.hash(auth.publicKey);
            key = auth.publicKey;
        };
        let newSubcriber : Subscriber = {
            var callback = callback;
        };
        let (newSubscribers, _) = Trie.put(subscribers, key, Blob.equal, newSubcriber);
        // Add new subscriber
        subscribers := newSubscribers;
        #ok;
    };

    public func unsubscribe(publicKey : Blob, signature : Blob) : async Channel.UnsubscribeResult {
        // TODO
        #ok;
    };

    public func publish(post : Post) : async () {
        publishedPosts := List.push(post, publishedPosts);
        let content : Feed.CallbackArgs = {
            message = #newContent({
                title = post.title;
                content = ?#text(#html(post.body));
                link = ""; // TODO
            });
            hashType = ""; // TODO or just SHA256?
            publicKey = Blob.fromArray([]); // TODO
            signature = Blob.fromArray([]); // TODO
            delegationChain = null; // TODO
        };
        for ((key, subscriber) in Trie.iter(subscribers)) {
            await subscriber.callback(content);
        };
    };
};
