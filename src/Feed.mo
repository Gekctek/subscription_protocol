import Hash "mo:base/Hash";
import Content "./Content";

module {

    public type CallbackArgs = {
        message : {
            #content : {
                title : Text;
                content : Content.Content;
            };
            #changeOwnerKey : {
                publicKey : Blob;
            };
        };
        publicKey : Blob;
        signature : Blob;
    };

    public type Callback = shared (update : CallbackArgs) -> async ();
};
