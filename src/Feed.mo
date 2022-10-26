import Hash "mo:base/Hash";
import Content "./Content";

module {

    public type InboxActor = actor {
        pushContent : (content : Content.Content) -> async ();
    };
};
