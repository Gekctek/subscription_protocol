import Feed "./Feed";
import Content "./Content";

module {

    public type SubscriptionId = Text;

    public type SubscribeResult = {
        #ok: SubscriptionId;
    };
    public type UnsubscribeResult = {
        #ok;
        #notSubscribed;
    };

    public type Subscription = {
        url: Text;
    };

    public type GetSubscriptionsResult = {
        #ok: [Subscription];
    };

    public type ChannelActor = actor {
        subscribe : (request : SubscribeRequest) -> async SubscribeResult;
        unsubscribe : () -> async UnsubscribeResult;
    };

    public type SubscribeRequest = {
        subscriptionId : SubscriptionId;
        callback: Feed.Callback;
        channels: [Text];
    };

    public type UnsubscribeRequest = {
        subscriptionId : SubscriptionId;
        channels: ?[Text];
    };
};
