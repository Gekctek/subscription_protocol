import TrieSet "mo:base/TrieSet";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Subscription "../../src/Subscription";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Content "../../src/Content";
import Iter "mo:base/Iter";
import Xml "Xml";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import IC "mo:base/ExperimentalInternetComputer";
import Cycles "mo:base/ExperimentalCycles";

actor RSSBridge {
    

    type SubscriptionInfo = {
        var callback : Subscription.Callback; // TODO is the use case for multiple callbacks worth it or what can do as an alternative?
        var channels : TrieSet.Set<Text>;
    };

    type UserInfo = {
        // TODO do multiple contexts per sub
        var subscriptions: Trie.Trie<Subscription.Id, SubscriptionInfo>;
    };

    type Feed = {
        lastUpdated: Time.Time;
    };

    private stable var feeds : Trie.Trie<Text, Feed> = Trie.empty();
    
    private stable var users : Trie.Trie<Principal, UserInfo> = Trie.empty();

    public shared ({ caller }) func addSubscription(request : Subscription.AddRequest) : async Subscription.AddResult {
        let user: UserInfo = getOrCreateUser(caller);
        
        let subKey = {
            hash = Text.hash(request.id);
            key = request.id;
        };
        let newSubscription: SubscriptionInfo = {
            var callback = request.callback;
            var channels = TrieSet.fromArray(request.channels, Text.hash, Text.equal);
        };
        let (newSubscriptions, currentSub) = Trie.put(user.subscriptions, subKey, Text.equal, newSubscription);
        
        switch(currentSub) {
            case (?sub) #alreadyExists;
            case (null) {
                user.subscriptions := newSubscriptions;
                #ok;
            }
        };
    };

    public shared ({caller}) func updateSubscription(request: Subscription.UpdateRequest) : async Subscription.UpdateResult {
        let user: UserInfo = switch(getUserOrDefault(caller)){
            case (null) return #notFound;
            case (?u) u;
        };
        
        let subKey = {
            hash = Text.hash(request.id);
            key = request.id;
        };
        let subscription: SubscriptionInfo = switch(Trie.get(user.subscriptions, subKey, Text.equal)){
            case (null) return #notFound;
            case (?sub) sub;
        };
        switch(request.channels) {
            case (null) {
                // Dont update
            };
            case (?channels) {
                switch(channels){
                    case (#add(a)) {
                        let newChannels: TrieSet.Set<Text> = TrieSet.fromArray(a, Text.hash, Text.equal);
                        subscription.channels := TrieSet.union(subscription.channels, newChannels, Text.equal);
                    };
                    case (#remove(r)){
                        for (channelToRemove in Iter.fromArray(r)){
                            subscription.channels := TrieSet.delete(subscription.channels, channelToRemove, Text.hash(channelToRemove), Text.equal);
                        }
                    };
                    case (#set(s)){
                        subscription.channels := TrieSet.fromArray(s, Text.hash, Text.equal);
                    };
                }
            };
        };
        #ok;
    };

    public shared ({ caller }) func deleteSubscription(request: Subscription.DeleteRequest) : async Subscription.DeleteResult {

        // Remove subscriber
        switch(getUserOrDefault(caller)){
            case (?user) {
                let subKey = {
                    hash = Text.hash(request.id);
                    key = request.id;
                };
                let (newSubscriptions, _) = Trie.remove(user.subscriptions, subKey, Text.equal);
                user.subscriptions := newSubscriptions;
                #ok;
            };
            case (null) #notFound;
        }
    };

    public shared query  ({ caller }) func getSubscription(id: Subscription.Id) : async Subscription.GetResult {
        switch(getUserOrDefault(caller)){
            case (null) #notFound;
            case (?user) {
                let subKey = {
                    hash = Text.hash(id);
                    key = id;
                };
                switch(Trie.get(user.subscriptions, subKey, Text.equal)){
                    case (null) #notFound;
                    case (?sub){
                        #ok({
                            id=id;
                            channels=TrieSet.toArray(sub.channels);
                            callback=sub.callback;
                        })
                    };
                };
            }
        };
    };

    public shared func push(channelId: Text, content : Content.Content) : async () {
        // TODO secure

        label f for ((userId, user) in Trie.iter(users)) {
            for ((subId, sub) in Trie.iter(user.subscriptions)) {
                let subHasChannel = TrieSet.mem(sub.channels, channelId, Text.hash(channelId), Text.equal);
                if (not subHasChannel) {
                    continue f;
                };
                let result = await sub.callback({
                    message = #newContent(content);
                    userId = userId;
                    channelId = channelId;
                    subscriptionId = subId;
                });
            }
        };
    };

    private func getOrCreateUser(id: Principal) : UserInfo {
        switch(getUserOrDefault(id)){
            case (?u) u;
            case (null){
                let newUser : UserInfo = {
                    var subscriptions = Trie.empty();
                };
                let key : Trie.Key<Principal> = {
                    hash = Principal.hash(id);
                    key = id;
                };
                // Add new subscriber
                let (newUsers, _) = Trie.put(users, key, Principal.equal, newUser);
                users := newUsers;
                newUser;
            }
        };
    };

    private func getUserOrDefault(id: Principal) : ?UserInfo {
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(id);
            key = id;
        };
        Trie.get(users, key, Principal.equal);
    };

};
