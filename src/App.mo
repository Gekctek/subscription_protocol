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
        instance : Channel.ChannelActor;
        publicKey : Blob;
        tags : [Text]; // TODO this should be tagging channel content to be able to filter
    };
};
