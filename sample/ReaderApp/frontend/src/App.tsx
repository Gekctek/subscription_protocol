import { Component, createResource, createSignal, For } from 'solid-js';
import { createActor } from '../declarations/FeedInstance';

import 'swiper/css';
import './App.css';
import FeedItem from './components/FeedItem';
import { Content } from './models/Content';
import { Swiper, SwiperSlide } from 'swiper/solid';
import { Principal } from '@dfinity/principal';


let canisterId = Principal.fromText("q4eej-kyaaa-aaaaa-aaaha-cai");

let actor = createActor(canisterId, {
  agentOptions: {
    host: "http://localhost:8000"
  },
  actorOptions: undefined
});

const [after, setAfter] = createSignal<bigint | null>(null);

async function fetchFeed(source: boolean, info: { value: Content[] | undefined; refetching: boolean | unknown }): Promise<Content[]> {
  let afterValue = after();
  let items = await actor.getFeed(10, afterValue ? [afterValue] : []);
  return items.map<Content>(i => {
    return {
      format: "txt",
      title: "Title",
      body: "Body"
    }
  });
};

const [feedItems, { mutate, refetch }] = createResource<Content[]>(fetchFeed);

const App: Component = () => {
  return (
    <>
      <Swiper
        slidesPerView={1}>
        <For each={feedItems()}>{(item) =>
          <SwiperSlide>
            <FeedItem value={item} />
          </SwiperSlide>
        }</For>
      </Swiper>
    </>
  );
};

export default App;
