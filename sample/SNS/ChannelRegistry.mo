import Channel "../../src/Channel";

actor ChannelRegistry {

    private stable var channelActorMap : Trie.Trie<Text, Channel.Actor>();

    public func register(channelId : Text, channelActor : Channel.Actor) : async Channel.RegistrationResult {
        let (newMap, oldValue) = Trie.put(channelActorMap, key, Text.equal);
        if (oldValue == null) {
            return #idAlreadyRegistered;
        };
        channelActorMap := newMap;
        #registered;
    };
};
