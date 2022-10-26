import Channel "../../src/Channel";
import ChannelInstance "./ChannelInstance";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";

actor ContentApp {

    private var channels : [ChannelInstance.ChannelInstance] = [];

    public type Result = {
        #created;
        #idAlreadyRegistered;
    };

    public func createChannel(channelId : Text) : async Result {
        let channel : Channel.SubscribeActor = await ChannelInstance.ChannelInstance(Principal.fromText(""));
        let registry : Channel.RegistryActor = actor ("");
        let registrationResult = await registry.register(channelId, channel);
        switch (registrationResult) {
            case (#registered) #created;
            case (#idAlreadyRegistered) #idAlreadyRegistered;
        };
    };
};
