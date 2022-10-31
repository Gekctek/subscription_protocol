import Hash "mo:base/Hash";
import Content "./Content";

module {

    type ChannelId = {
        appId : Text;
        channelId : Text;
    };

    public type CallbackArgs = {
        message : {
            #content : {
                title : Text;
                content : Content.Content;
            };
            #changeOwnerKey : {
                publicKey : Blob;
            };
            #changeId : {
                newId : ChannelId;
            };
        };
        channelId : ChannelId;
        publicKey : Blob;
        signature : Blob;
    };

    public type Callback = shared (update : CallbackArgs) -> async ();
};
