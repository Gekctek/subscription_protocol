import Feed "./Feed";

module {
    public type SubscribeResult = {
        #ok;
        #error : Text;
    };
    public type UnsubscribeResult = {
        #ok;
        #error : Text;
    };

    public type SubscribeActor = actor {
        subscribe : (inbox : Feed.InboxActor, signature : Blob) -> async SubscribeResult;
        unsubscribe : (inbox : Feed.InboxActor, signature : Blob) -> async UnsubscribeResult;
    };
};
