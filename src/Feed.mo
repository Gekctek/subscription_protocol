import Hash "mo:base/Hash";
import Time "mo:base/Time";
import Content "./Content";

module {
    public type CallbackArgs = {
        message : {
            #newContent : Content.Content;
            #changeOwner : Principal;
        };
        channelId : Text;
        contextId : Text;
    };

    public type CallbackResult = {
        #accepted;
        #notAuthorized;
    };

    public type Callback = shared (update : CallbackArgs) -> async CallbackResult;
};
