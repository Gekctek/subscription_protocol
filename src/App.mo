import Channel "./Channel";

module {
    public type RegistrationResult = {
        #ok;
        #idAlreadyRegistered;
    };

    public type App = {
        publicKey : Blob;
        signature : Blob;
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
        register : (appId : Text, app : App) -> async RegistrationResult;
        getChannelInfo : (appId : Text, channelId : Text) -> async GetChannelInfoResult;
    };
};
