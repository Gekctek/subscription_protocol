import Blob "mo:base/Blob";
import App "../../src/App";
import Channel "../../src/Channel";
import ChannelInstance "./ChannelInstance";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Cycles "mo:base/ExperimentalCycles";

actor ContentApp {

    type ChannelInfo = {
        name : Text;
        description : ?Text;
        instance : ChannelInstance.ChannelInstance;
    };

    type CreateChannelResult = {
        #created : Principal;
        #idAlreadyRegistered : Principal;
    };

    private stable var channels : Trie.Trie<Text, ChannelInfo> = Trie.empty();

    public func getChannelInfo(channelId : Text) : async App.GetChannelInfoResult {
        let key = {
            hash = Text.hash(channelId);
            key = channelId;
        };
        switch (Trie.get(channels, key, Text.equal)) {
            case (?c) {
                #ok({
                    id = channelId;
                    name = c.name;
                    description = c.description;
                    instance = Principal.fromActor(c.instance);
                    tags = []; // TODO
                });
            };
            case (null) #notFound;
        };
    };

    public shared ({ caller }) func createChannel(info : { channelId : Text; name : Text; description : ?Text }) : async CreateChannelResult {

        let key = {
            hash = Text.hash(info.channelId);
            key = info.channelId;
        };

        let existingChannel : ?ChannelInfo = Trie.get(channels, key, Text.equal);
        switch (existingChannel) {
            case (null) {
                let cost = 1_000_000_000_000;
                // let acceptedAmount = Cycles.accept(cost); // TODO
                let acceptedAmount = cost;
                Cycles.add(acceptedAmount);
                let newInstance : ChannelInstance.ChannelInstance = await ChannelInstance.ChannelInstance(info.channelId, caller);
                let newChannel = {
                    name = info.name;
                    description = info.description;
                    instance = newInstance;
                };
                let (newChannels, _) = Trie.put(channels, key, Text.equal, newChannel);
                channels := newChannels;
                #created(Principal.fromActor(newInstance));
            };
            case (?ec) {
                #idAlreadyRegistered(Principal.fromActor(ec.instance));
            };
        };
    };

    public shared ({ caller }) func upgradeChannels() : async () {
        for ((id, channel) in Trie.iter(channels)) {
            let z = await (system ChannelInstance.ChannelInstance)(#upgrade(channel.instance))(id, caller);
        };
    };
};
