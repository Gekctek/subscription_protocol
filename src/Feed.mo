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
    };

    public type CallbackResult = {
        #accepted;
        #notAuthorized;
    };

    public type Actor = actor {
        channelCallback : Callback;
    };

    public type Callback = shared (update : CallbackArgs) -> async CallbackResult;
};
