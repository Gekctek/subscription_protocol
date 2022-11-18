import { Component, createSignal } from "solid-js";
import { createChannelActor } from "../api/ChannelActor";
import { ContentApp } from "../api/ContentAppActor";
import { feedCanisterId } from "../Signals";


const [channelId, setChannelId] = createSignal<string>("");



// async function fetchChannels(getChannelId: string, info: { value: ChannelInfo[] | undefined; refetching: boolean | unknown }): Promise<ChannelInfo[]> {
//   let channel = await ContentApp.getChannelInfo(getChannelId);
//   if ('ok' in channel) {
//     return [channel.ok];
//   }
//   return [];
// };

// const [channels, channelResource] = createResource(channelId, fetchChannels);


async function subscribe(e: SubmitEvent) {
    e.preventDefault();
    let channelGetResult = await ContentApp.getChannelInfo(channelId());
    if (!('ok' in channelGetResult)) {
        alert('channel not found');
        return;
    }
    let channel = channelGetResult.ok;
    let actor = createChannelActor(channel.instance);
    let feedCanister = feedCanisterId();
    if (feedCanister == null) {
        alert('no feed specified');
        return;
    }
    let result = await actor.subscribe([feedCanister, "channelCallback"], {});
    console.log(result);
}



const Subscriptions: Component = () => {
    return (
        <form onSubmit={subscribe}>
            <label>Search channel by id</label>
            <input
                type='text'
                value={channelId()}
                onInput={(v) => setChannelId(v.currentTarget.value)}
            />
            <button>Subscribe</button>
        </form>
    );
};

export default Subscriptions;