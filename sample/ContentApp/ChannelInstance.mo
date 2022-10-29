import Text "mo:base/Text";
import List "mo:base/List";
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

    private stable var publishedPosts : List.List<Post> = List.nil<Post>();
    private stable var subscribedFeeds : Trie.Trie<Principal, Feed.InboxActor> = Trie.empty();

    public func subscribe(inbox : Feed.InboxActor, signature : Blob) : async Channel.SubscribeResult {
        // TODO validate signature. How to do while keeping user(s) anonymous?

        let inboxKey = buildInboxKey(inbox);
        let (newSubscribedFeeds, _) = Trie.put(subscribedFeeds, inboxKey, Principal.equal, inbox);
        subscribedFeeds := newSubscribedFeeds;
        #ok;
    };

    public func unsubscribe(inbox : Feed.InboxActor, signature : Blob) : async Channel.UnsubscribeResult {
        // TODO validate signature. How to do while keeping user(s) anonymous?
        let inboxKey = buildInboxKey(inbox);
        let (newSubscribedFeeds, _) = Trie.remove(subscribedFeeds, inboxKey, Principal.equal);
        subscribedFeeds := newSubscribedFeeds;
        #ok;
    };

    public func publish(post : Post) : async () {
        publishedPosts := List.push(post, publishedPosts);
        let content : Content.Content = {
            title = post.title;
            body = #text(#raw(post.body));
        };
        for ((key, inbox) in Trie.iter(subscribedFeeds)) {
            await inbox.pushContent(content);
        };
    };

    private func buildInboxKey(inbox : Feed.InboxActor) : Trie.Key<Principal> {
        // TODO change principal to 'user' identity/marker
        let inboxPrincipal = Principal.fromActor(inbox);
        {
            hash = Principal.hash(inboxPrincipal);
            key = inboxPrincipal;
        };
    };
};
