actor ReaderApp {

    public func createFeed(channelId : Text) : async Result {
        let channel : Channel.SubscribeActor = await ChannelInstance.ChannelInstance(Principal.fromText(""));
        let registry : Channel.RegistryActor = actor ("");
        let registrationResult = await registry.register(channelId, channel);
        switch (registrationResult) {
            case (#registered) #created;
            case (#idAlreadyRegistered) #idAlreadyRegistered;
        };
    };
};
