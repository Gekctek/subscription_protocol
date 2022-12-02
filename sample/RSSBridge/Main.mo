import List "mo:base/List";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Channel "../../src/Channel";
import Feed "../../src/Feed";
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
    

    type Subscription = {
        var callback : Feed.Callback; // TODO is the use case for multiple callbacks worth it or what can do as an alternative?
        var channels : List.List<Text>;
    };

    type SubscriptionId = Text;

    type UserInfo = {
        // TODO do multiple contexts per sub
        var subscriptions: Trie.Trie<SubscriptionId, Subscription>;
    };

    type Feed = {
        lastUpdated: Time.Time;
    };

    private stable var feeds : Trie.Trie<Text, Feed> = Trie.empty();
    
    private stable var users : Trie.Trie<Principal, UserInfo> = Trie.empty();

    public shared ({ caller }) func subscribe(request : Channel.SubscribeRequest) : async Channel.SubscribeResult {
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(caller);
            key = caller;
        };
        switch(Trie.get(users, key, Principal.equal)) {
            case (?user) {
                let subKey = {
                    hash = Text.hash(request.subscriptionId);
                    key = request.subscriptionId;
                };
                switch(Trie.get(user.subscriptions, subKey, Text.equal)) {
                    case (?sub){
                        sub.channels := List.append<Text>(sub.channels, List.fromArray(request.channels));
                    }
                };
                
            };
            case (null) {
                let newUser : UserInfo = {
                    var subscriptions = Trie.empty();
                };

                Trie.put(subscriptions, key, Principal.equal, newSubscription);
                // Add new subscriber
                let (newSubscribers, _) = Trie.put(subscribers, key, Principal.equal, newSubcriber);
                subscribers := newSubscribers;
            };
        };
        #ok;
    };

    public shared ({ caller }) func unsubscribe(request: Channel.UnsubscribeRequest) : async Channel.UnsubscribeResult {
        let key : Trie.Key<Principal> = {
            hash = Principal.hash(caller);
            key = caller;
        };
        // Remove subscriber
        switch(Trie.get(subscribers, key, Principal.equal)){
            case (?sub) {
                sub.channels := 
                #ok;
            };
            case (null) #notSubscribed;
        }
    };

    public shared query  ({ caller }) func getSubscriptions() : async Channel.GetSubscriptionsResult {
        let key = {
            hash=Principal.hash(caller);
            key=caller
        };
        let subscriptions: [Channel.Subscription] = switch(Trie.get(subscribers, key, Principal.equal)){
            case (null) [];
            case (?subscriberInfo) {
                Array.map<Text, Channel.Subscription>(subscriberInfo.channels, func (c) { { url=c } });
            }
        };
        #ok(subscriptions);
    };

    public shared func push(channelId: Text, content : Content.Content) : async () {
        // TODO secure

        label f for ((owner, sub) in Trie.iter(subscribers)) {
            if (Array.find<Text>(sub.channels, func (c) { c == channelId}) == null) {
                continue f;
            };
            let result = await sub.callback({
                message = #newContent(content);
                channelId = channelId;
                contextId = sub.contextId;
            });
        };
    };

};
