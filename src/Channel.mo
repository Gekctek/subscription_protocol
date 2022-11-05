import Feed "./Feed";
import Content "./Content";

module {
    public type SubscribeResult = {
        #ok;
    };
    public type UnsubscribeResult = {
        #ok;
    };

    public type ChannelActor = actor {
        subscribe : (callback : Feed.Callback, publicKey : Blob, signature : Blob, options : ?SubscriptionOptions) -> async SubscribeResult;
        unsubscribe : (publicKey : Blob, signature : Blob) -> async UnsubscribeResult;
    };

    public type SubscriptionOptions = {

    };
};
