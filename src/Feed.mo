import Hash "mo:base/Hash";
import Time "mo:base/Time";
import Content "./Content";

module {
    public type Delegation = {
        expiration : Time.Time;
        publicKey : Blob;
    };

    public type SignedDelegation = {
        delegation : Delegation;
        signature : Blob;
    };

    public type CallbackArgs = {
        message : {
            #newContent : {
                title : Text;
                content : ?Content.Content;
                link : Text;
            };
            #changeOwnerKey : {
                publicKey : Blob;
            };
        };
        hashType : Text; // TODO text vs variant?
        publicKey : Blob; // Actual public key of the owner
        delegationChain : ?[SignedDelegation]; // Last one here ultimately signs the message
        signature : Blob; // Der encoded
    };

    public type Callback = shared (update : CallbackArgs) -> async ();
};
