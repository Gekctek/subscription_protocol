import Content "../../src/Content";
import Cycles "mo:base/ExperimentalCycles";
import Feed "../../src/Feed";
import FeedInstance "./FeedInstance.old";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor ReaderApp {

    private stable var feeds : Trie.Trie<Principal, FeedInstance.FeedInstance> = Trie.empty();

    public type GetResult = {
        #ok : Principal;
        #notFound;
        #notAuthenticated;
    };
    public type CreateResult = {
        #ok : Principal;
        // #notEnoughFunds;// TODO
        #notAuthenticated;
    };

    public shared query ({ caller }) func getUserFeed() : async GetResult {
        if (Principal.isAnonymous(caller)) {
            return #notAuthenticated;
        };
        let key = {
            hash = Principal.hash(caller);
            key = caller;
        };
        let existingFeed = Trie.get(feeds, key, Principal.equal);
        switch (existingFeed) {
            case (null) {
                #notFound;
            };
            case (?ef) {
                #ok(Principal.fromActor(ef));
            };
        };
    };

    public shared ({ caller }) func createUserFeed() : async CreateResult {
        let cost = 1_000_000_000_000;
        // let cyclesAccepted = Cycles.accept(cost); TODO
        Cycles.add(cost);
        let key = {
            hash = Principal.hash(caller);
            key = caller;
        };
        let newFeed : FeedInstance.FeedInstance = await FeedInstance.FeedInstance(caller);
        let (newFeeds, _) = Trie.put(feeds, key, Principal.equal, newFeed);
        feeds := newFeeds;
        #ok(Principal.fromActor(newFeed));
    };

    public shared func upgradeFeeds() : async () {
        for ((owner, feed) in Trie.iter(feeds)) {
            let z = await (system FeedInstance.FeedInstance)(#upgrade(feed))(owner);
        };
    };
};
