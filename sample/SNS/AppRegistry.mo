import Array "mo:base/Array";
import Principal "mo:base/Principal";
import App "../../src/App";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor AppRegistry {

    private stable var apps : Trie.Trie<Text, App.App> = Trie.empty();

    type AppInfo = {
        id : Text;
        name : Text;
        description : Text;
    };

    public query func getRegisteredApps() : async [App.App] {
        Trie.toArray<Text, App.App, App.App>(
            apps,
            func(k, v) {
                v;
            },
        );
    };

    public shared ({ caller }) func register(app : App.App) : async App.RegistrationResult {
        if (Array.find<Principal>(app.owners, func(o) { o == caller }) == null) {
            return #notAuthorized;
        };
        let key = {
            hash = Text.hash(app.id);
            key = app.id;
        };
        let (newMap, oldValue) = Trie.put(apps, key, Text.equal, app);
        if (oldValue != null) {
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
