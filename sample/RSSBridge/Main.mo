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
        var subscriptions : Trie.Trie<Subscription.Id, SubscriptionInfo>;
    };

    type Feed = {
        lastUpdated : ?Time.Time;
    };

    private stable var feeds : Trie.Trie<Text, Feed> = Trie.empty();

    private stable var users : Trie.Trie<Principal, UserInfo> = Trie.empty();

    public shared ({ caller }) func addSubscription(request : Subscription.AddRequest) : async Subscription.AddResult {
        let user : UserInfo = switch (getOrCreateUser(caller)) {
            case (#ok(u)) u;
            case (#notAuthenticated) return #notAuthenticated;
        };

        let subKey = {
            hash = Text.hash(request.id);
            key = request.id;
        };
        for (c in Iter.fromArray(request.channels)) {
            let _ = addFeed(c); // TODO
        };
        let newSubscription : SubscriptionInfo = {
            var callback = request.callback;
            var channels = TrieSet.fromArray(request.channels, Text.hash, Text.equal);
        };
        let (newSubscriptions, currentSub) = Trie.put(user.subscriptions, subKey, Text.equal, newSubscription);

        switch (currentSub) {
            case (?sub) #alreadyExists;
            case (null) {
                user.subscriptions := newSubscriptions;
                #ok;
            };
        };
    };

    type AddFeedResult = { #ok; #alreadyExists };

    private func addFeed(url : Text) : AddFeedResult {
        // TODO secure and test the feed
        let key = {
            hash = Text.hash(url);
            key = url;
        };
        let (newFeeds, currentFeed) = Trie.put(feeds, key, Text.equal, { lastUpdated = null });
        switch (currentFeed) {
            case (null) {
                feeds := newFeeds;
                #ok;
            };
            case (?f) #alreadyExists;
        };
    };

    public shared ({ caller }) func updateSubscription(request : Subscription.UpdateRequest) : async Subscription.UpdateResult {
        let user : UserInfo = switch (getUser(caller)) {
            case (#notFound) return #notFound;
            case (#notAuthenticated) return #notAuthenticated;
            case (#ok(u)) u;
        };

        let subKey = {
            hash = Text.hash(request.id);
            key = request.id;
        };
        let subscription : SubscriptionInfo = switch (Trie.get(user.subscriptions, subKey, Text.equal)) {
            case (null) return #notFound;
            case (?sub) sub;
        };
        switch (request.channels) {
            case (null) {
                // Dont update
            };
            case (?channels) {
                switch (channels) {
                    case (#add(a)) {
                        let newChannels : TrieSet.Set<Text> = TrieSet.fromArray(a, Text.hash, Text.equal);
                        subscription.channels := TrieSet.union(subscription.channels, newChannels, Text.equal);
                    };
                    case (#remove(r)) {
                        for (channelToRemove in Iter.fromArray(r)) {
                            subscription.channels := TrieSet.delete(subscription.channels, channelToRemove, Text.hash(channelToRemove), Text.equal);
                        };
                    };
                    case (#set(s)) {
                        subscription.channels := TrieSet.fromArray(s, Text.hash, Text.equal);
                    };
                };
            };
        };
        #ok;
    };

    public shared ({ caller }) func deleteSubscription(request : Subscription.DeleteRequest) : async Subscription.DeleteResult {

        // Remove subscriber
        switch (getUser(caller)) {
            case (#notFound) #notFound;
            case (#notAuthenticated) #notAuthenticated;
            case (#ok(user)) {
                let subKey = {
                    hash = Text.hash(request.id);
                    key = request.id;
                };
                let (newSubscriptions, _) = Trie.remove(user.subscriptions, subKey, Text.equal);
                user.subscriptions := newSubscriptions;
                #ok;
            };
        };
    };

    public shared query ({ caller }) func getSubscription(id : Subscription.Id) : async Subscription.GetResult {
        switch (getUser(caller)) {
            case (#notFound) #notFound;
            case (#notAuthenticated) #notAuthenticated;
            case (#ok(user)) {
                let subKey = {
                    hash = Text.hash(id);
                    key = id;
                };
                switch (Trie.get(user.subscriptions, subKey, Text.equal)) {
                    case (null) #notFound;
                    case (?sub) {
                        #ok({
                            id = id;
                            channels = TrieSet.toArray(sub.channels);
                            callback = sub.callback;
                        });
                    };
                };
            };
        };
    };

    type ChannelInfo = {
        id : Text;
        lastUpdated : ?Time.Time;
    };
    public shared func getChannels() : async [ChannelInfo] {
        Trie.toArray<Text, Feed, ChannelInfo>(
            feeds,
            func(k, v) {
                {
                    id = k;
                    lastUpdated = v.lastUpdated;
                };
            },
        );
    };

    public shared func push(channelId : Text, content : Content.Content) : async () {
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
            };
        };
    };

    private func getOrCreateUser(id : Principal) : {
        #ok : UserInfo;
        #notAuthenticated;
    } {
        let user = switch (getUser(id)) {
            case (#ok(u)) u;
            case (#notAuthenticated) return #notAuthenticated;
            case (#notFound) {
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
            };
        };
        #ok(user);
    };

    private func getUser(id : Principal) : {
        #ok : UserInfo;
        #notFound;
        #notAuthenticated;
    } {
        if (Principal.isAnonymous(id)) {
            return #notAuthenticated;
        };
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(id);
            key = id;
        };
        switch (Trie.get(users, key, Principal.equal)) {
            case (null) #notFound;
            case (?user) #ok(user);
        }

    };

};
