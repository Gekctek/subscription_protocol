import Content "../../src/Content";
import Cycles "mo:base/ExperimentalCycles";
import Feed "../../src/Feed";
import FeedInstance "./FeedInstance";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor ReaderApp {

    private stable var feeds : Trie.Trie<Text, FeedInstance.FeedInstance> = Trie.empty();

    public type Result = {
        #created : Principal;
        #idAlreadyRegistered : Principal;
    };

    public func createFeed(feedId : Text) : async Result {
        Cycles.add(1000000000000);
        let feed : FeedInstance.FeedInstance = await FeedInstance.FeedInstance();
        let key = {
            hash = Text.hash(feedId);
            key = feedId;
        };
        let (newfeeds, existingFeed) = Trie.put(feeds, key, Text.equal, feed);
        switch (existingFeed) {
            case (null) {
                feeds := newfeeds;
                #created(Principal.fromActor(feed));
            };
            case (?ef) {
                #idAlreadyRegistered(Principal.fromActor(ef));
            };
        };
    };
};
