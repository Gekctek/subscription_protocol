import Blob "mo:base/Blob";
import Channel "../../src/Channel";
import ChannelInstance "./ChannelInstance";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Cycles "mo:base/ExperimentalCycles";

actor ContentApp {

    private stable var channels : Trie.Trie<Text, ChannelInstance.ChannelInstance> = Trie.empty();

    public type Result = {
        #created : Principal;
        #idAlreadyRegistered : Principal;
    };

    public func createChannel(channelId : Text) : async Result {
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
