import Feed "./Feed";
import Content "./Content";

module {
    public type SubscribeResult = {
        #ok;
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
        callback: Feed.Callback;
        contextId : Text;
        channels: [Text];
    };
};
