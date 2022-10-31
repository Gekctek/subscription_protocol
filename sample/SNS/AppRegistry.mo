import App "../../src/App";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor AppRegistry {

    private stable var apps : Trie.Trie<Text, App.App> = Trie.empty();

    public func register(appId : Text, app : App.App) : async App.RegistrationResult {
        // TODO validate that the app's signature or proof of ownership
        let key = {
            hash = Text.hash(appId);
            key = appId;
        };
        let (newMap, oldValue) = Trie.put(apps, key, Text.equal, app);
        if (oldValue == null) {
            return #idAlreadyRegistered;
        };
        apps := newMap;
        #ok;
    };

    public func getChannelInfo(appId : Text, channelId : Text) : async App.GetChannelInfoResult {
        let key = {
            hash = Text.hash(appId);
            key = appId;
        };
        switch (Trie.get(apps, key, Text.equal)) {
            case (null) {
                return #notFound;
            };
            case (?app) {
                await app.getChannelInfo(channelId);
            };
        };
    };
};
