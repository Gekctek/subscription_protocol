import Content "../../src/Content";
import Cycles "mo:base/ExperimentalCycles";
import Feed "../../src/Feed";
import FeedInstance "./FeedInstance";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor ReaderApp {

    private stable var feeds : Trie.Trie<Principal, FeedInstance.FeedInstance> = Trie.empty();

    public type Result = {
        #created : Principal;
        #exists : Principal;
    };

    public shared ({ caller }) func getOrCreateFeed() : async Result {
        // TODO validate not anonymous?
        let key = {
            hash = Principal.hash(caller);
            key = caller;
        };
        let existingFeed = Trie.get(feeds, key, Principal.equal);
        switch (existingFeed) {
            case (null) {
                let cost = 1_000_000_000_000;
                // let cyclesAccepted = Cycles.accept(cost); TODO
                Cycles.add(cost);
                let newFeed : FeedInstance.FeedInstance = await FeedInstance.FeedInstance(caller);
                let (newFeeds, _) = Trie.put(feeds, key, Principal.equal, newFeed);
                feeds := newFeeds;
                #created(Principal.fromActor(newFeed));
            };
            case (?ef) {
                #exists(Principal.fromActor(ef));
            };
        };
    };

    public shared func upgradeFeeds() : async () {
        for ((owner, feed) in Trie.iter(feeds)) {
            let z = await (system FeedInstance.FeedInstance)(#upgrade(feed))(owner);
        };
    };
};
