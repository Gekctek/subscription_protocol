import Blob "mo:base/Blob";
import App "../../src/App";
import Channel "../../src/Channel";
import ChannelInstance "./ChannelInstance";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Cycles "mo:base/ExperimentalCycles";

actor ContentApp {

    private stable var channels : Trie.Trie<Text, ChannelInstance.ChannelInstance> = Trie.empty();

    type CreateChannelResult = {
        #created : Principal;
        #idAlreadyRegistered : Principal;
    };

    public func register(appId : Text, registry : Principal) : async App.RegistrationResult {
        let appRegistry : App.RegistryActor = actor (Principal.toText(registry));

        let publicKey = Blob.fromArray([]); // TODO
        let signature = Blob.fromArray([]); // TODO

        await appRegistry.register(
            appId,
            {
                publicKey = publicKey;
                signature = signature;
                getChannelInfo = getChannelInfo;
            },
        );
    };

    public func getChannelInfo(channelId : Text) : async App.GetChannelInfoResult {
        let key = {
            hash = Text.hash(channelId);
            key = channelId;
        };
        switch (Trie.get(channels, key, Text.equal)) {
            case (?c) {
                #ok({
                    instance = Principal.fromActor(c);
                    tags = []; // TODO
                });
            };
            case (null) #notFound;
        };
    };

    public func createChannel(channelId : Text) : async CreateChannelResult {
        Cycles.add(1000000000000);
        let channel : ChannelInstance.ChannelInstance = await ChannelInstance.ChannelInstance();
        let key = {
            hash = Text.hash(channelId);
            key = channelId;
        };
        let (newChannels, existingChannel) = Trie.put(channels, key, Text.equal, channel);
        switch (existingChannel) {
            case (null) {
                channels := newChannels;
                #created(Principal.fromActor(channel));
            };
            case (?ec) {
                #idAlreadyRegistered(Principal.fromActor(ec));
            };
        };
    };
};
