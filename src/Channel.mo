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
        subscribe : (feedId : Text, signature : Blob) -> async SubscribeResult;
        unsubscribe : (feedId : Text, signature : Blob) -> async UnsubscribeResult;
    };

    public type RegistrationResult = {
        #registered;
        #idAlreadyRegistered;
    };

    public type RegistryActor = actor {
        register(channelId : Text, channelActor : SubscribeActor) : async RegistrationResult;
    };
};
