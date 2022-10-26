import FeedInstance "./FeedInstance";
import Feed "../../src/Feed";
import Content "../../src/Content";

actor ReaderApp {

    public func createFeed(channelId : Text) : async Result {
        let channel : Feed.InboxActor = await FeedInstance.FeedInstance(Principal.fromText(""));
        let registry : Feed.RegistryActor = actor ("");
        let registrationResult = await registry.register(channelId, channel);
        switch (registrationResult) {
            case (#registered) #created;
            case (#idAlreadyRegistered) #idAlreadyRegistered;
        };
    };
};
