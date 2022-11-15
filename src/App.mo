import Channel "./Channel";

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
        instance : Principal;
        tags : [Text]; // TODO this should be tagging channel content to be able to filter
    };

    public type RegistryActor = actor {
        register : (app : App) -> async RegistrationResult;
        getChannelInfo : (appId : Text, channelId : Text) -> async GetChannelInfoResult;
    };
};
