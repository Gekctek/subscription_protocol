
module {
    public type RegistrationResult = {
        #ok;
        #notAuthorized;
        #idAlreadyRegistered;
    };

    public type App = {
        id : Text;
        name : Text;
        owners : [Principal];
        description : Text;
        getChannelInfo : shared (channelId : Text) -> async GetChannelInfoResult;
    };

    public type GetChannelInfoResult = {
        #ok : ChannelInfo;
        #notFound;
    };

    public type ChannelInfo = {
        id : Text;
        name : Text;
        description : ?Text;
        instance : Principal;
    };

    public type RegistryActor = actor {
        register : (app : App) -> async RegistrationResult;
        getChannelInfo : (appId : Text, channelId : Text) -> async GetChannelInfoResult;
    };
};
