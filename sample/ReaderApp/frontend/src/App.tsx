import { Component, createResource, createSignal, For } from 'solid-js';

import 'swiper/css';
import './App.css';
import FeedItem from './components/FeedItem';
import { Swiper, SwiperSlide } from 'swiper/solid';
import { Principal } from '@dfinity/principal';
import LoginButton from './components/LoginButton';
import { identity } from './api/Identity';
import { Identity } from '@dfinity/agent';
import { ChannelInfo } from './api/models/ChannelInfo';
import { ContentApp } from './api/ContentAppActor';
import { createFeedActor, FeedItemInfo } from './api/FeedActor';
import { createChannelActor } from './api/ChannelActor';
import { feedCanisterId, setFeedCanisterId } from './Signals';
import { ReaderApp } from './api/ReaderAppActor';


const [after, setAfter] = createSignal<bigint | null>(null);

async function fetchFeed(canisterId: Principal, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
  let afterValue = after();
  let actor = createFeedActor(canisterId);
  return await actor.getFeed(10, afterValue ? [afterValue] : []);

};

// async function fetchChannels(getChannelId: string, info: { value: ChannelInfo[] | undefined; refetching: boolean | unknown }): Promise<ChannelInfo[]> {
//   let channel = await ContentApp.getChannelInfo(getChannelId);
//   if ('ok' in channel) {
//     return [channel.ok];
//   }
//   return [];
// };

// const [channels, channelResource] = createResource(channelId, fetchChannels);

const [feedItems, { mutate, refetch }] = createResource(feedCanisterId, fetchFeed);

const [channelId, setChannelId] = createSignal<string>("");

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
async function getOrCreateFeed() {
  let feedResult = await ReaderApp.getOrCreateFeed();
  let feed;
  if ('created' in feedResult) {
    feed = feedResult.created;
  } else {
    feed = feedResult.exists;
  };
  setFeedCanisterId(feed);
}

await getOrCreateFeed(); // TODO

const App: Component = () => {
  let channelMap: Record<string, ChannelInfo> = {
    "1": {
      id: "1",
      name: "Channel 1",
      description: "The best channel",
      instance: Principal.anonymous(),
      tags: []
    },
    "2": {
      id: "2",
      name: "Channel 2",
      description: "The 2nd best channel",
      instance: Principal.anonymous(),
      tags: []
    }
  }; // TODO
  return (
    <>
      <div style={{ "margin-bottom": "20px" }}>
        <LoginButton />
        <button onClick={refetch}>Refresh</button>
        <form onSubmit={subscribe}>
          <label>Search channel by id</label>
          <input
            type='text'
            value={channelId()}
            onInput={(v) => setChannelId(v.currentTarget.value)}
          />
          <button>Subscribe</button>
        </form>
      </div>
      {/* <div>
        <For each={channels()}>{(channel) =>
          <div>
            <h2>{channel.id}</h2>
            <h2>{channel.name}</h2>
            <button onClick={() => subscribe(channel)}>Subscribe</button>
          </div>
        }</For>
      </div> */}
      <Swiper
        slidesPerView={1}>
        <For each={feedItems()}>{(item) =>
          <SwiperSlide>
            <FeedItem value={item} channel={channelMap[item.channelId]} />
          </SwiperSlide>
        }</For>
      </Swiper>
    </>
  );
};

export default App;
