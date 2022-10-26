import Text "mo:base/Text";
import List "mo:base/List";
import Principal "mo:base/Principal";
import TrieSet "mo:base/TrieSet";
import Channel "../../src/Channel";
import Content "../../src/Content";

actor class ChannelInstance(distributerPrincipal : Principal) {

    private type Post = {
        title : Text;
        body : Text;
    };

    private type Distributer = actor {
        distribute(content : Content.Content, feeds : [Text]) : async ();
    }; // TODO how to deduplicate with Distributer file

    private stable var publishedPosts : List.List<Post> = List.nil<Post>();
    private stable var subscribedFeeds : TrieSet.Set<Text> = TrieSet.empty();

    public func subscribe(feedId : Text, signature : Blob) : async Channel.SubscribeResult {
        // TODO validate signature. How to do while keeping user(s) anonymous?
        let feedIdHash = Text.hash(feedId);
        subscribedFeeds := TrieSet.put(subscribedFeeds, feedId, feedIdHash, Text.equal);
        #ok;
    };

    public func unsubscribe(feedId : Text, signature : Blob) : async Channel.UnsubscribeResult {
        // TODO validate signature. How to do while keeping user(s) anonymous?
        let feedIdHash = Text.hash(feedId);
        subscribedFeeds := TrieSet.delete(subscribedFeeds, feedId, feedIdHash, Text.equal);
        #ok;
    };

    public func publish(post : Post) : async () {
        publishedPosts := List.push(post, publishedPosts);
        let distributer : Distributer = actor (Principal.toText(distributerPrincipal));
        let content : Content.Content = {
            title = post.title;
            body = #text(#raw(post.body));
        };
        await distributer.distribute(content, TrieSet.toArray(subscribedFeeds));
    };
};
