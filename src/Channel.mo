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

    public type ChannelActor = actor {
        subscribe : (callback : Feed.Callback, options : ?SubscriptionOptions) -> async SubscribeResult;
        unsubscribe : () -> async UnsubscribeResult;
    };

    public type SubscriptionOptions = {

    };
};
