import Trie "mo:base/Trie";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Feed "../../src/Feed";
import Content "../../src/Content";

actor Distributer {

    private type FeedInfo = {
        receiveContentCallback : shared (content : Content.Content) -> ();
    };

    private var feedDestinations : Trie.Trie<Text, FeedInfo> = Trie.empty();

    public func distribute(content : Content.Content, feeds : [Text]) : async () {
        if (feedDestinations == #empty) {
            await setFeedDestinations();
        };
        for (feedId in Iter.fromArray(feeds)) {
            try {
                await distributeFeed(content, feedId);
            } catch (e) {
                // TODO
            };
        };
    };

    public func updateFeedInfo(feedId : Text, info : FeedInfo) : async () {
        // TODO validation coming from registry
        let key = buildFeedKey(feedId);
        let (newFeedDestinations, oldValue) = Trie.put<Text, FeedInfo>(feedDestinations, key, Text.equal, info);
        feedDestinations := newFeedDestinations;
    };

    private func buildFeedKey(feedId : Text) : Trie.Key<Text> {
        {
            hash = Text.hash(feedId);
            key = feedId;
        };
    };

    private func distributeFeed(content : Content.Content, feedId : Text) : async () {
        let key = buildFeedKey(feedId);
        switch (Trie.get(feedDestinations, key, Text.equal)) {
            case (null) {
                await handleFeedDoesntExist(feedId);
            };
            case (?dest) {
                dest.receiveContentCallback(content);
            };
        };

    };

    private func setFeedDestinations() : async () {
        // TODO get all from registry
    };

    private func handleFeedDoesntExist(feedId : Text) : async () {
        // TODO send unsubscribe message?
    };
};
