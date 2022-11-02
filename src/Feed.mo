import Hash "mo:base/Hash";
import Content "./Content";

module {

    public type Source = {
        registry : Principal;
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
            #changeSource : Source;
        };
        source : Source;
        publicKey : Blob;
        signature : Blob;
    };

    public type Callback = shared (update : CallbackArgs) -> async ();
};
