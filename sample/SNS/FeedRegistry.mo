import Feed "../../src/Feed";

actor FeedRegistry {

    private stable var FeedActorMap : Trie.Trie<Text, Feed.InboxActor>();

    public func register(FeedId : Text, FeedActor : Feed.Actor) : async Feed.RegistrationResult {
        let (newMap, oldValue) = Trie.put(FeedActorMap, key, Text.equal);
        if (oldValue == null) {
            return #idAlreadyRegistered;
        };
        FeedActorMap := newMap;
        #registered;
    };
};
