import App "../../src/App";
import Trie "mo:base/Deque";

actor AppRegistry {

    private stable var apps : Trie.Trie<Text, App.App> = Trie.empty();

    public func register(appId : Text, app : App.App) : async App.RegistrationResult {
        // TODO validate that the app's signature or proof of ownership
        let (newMap, oldValue) = Trie.put(apps, key, Text.equal);
        if (oldValue == null) {
            return #idAlreadyRegistered;
        };
        channelActorMap := newMap;
        #registered;
    };
};
