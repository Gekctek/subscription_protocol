import { Component, createResource, createSignal, For } from 'solid-js';
import { createActor } from './services/FeedService';

import 'swiper/css';
import './App.css';
import FeedItem from './components/FeedItem';
import { Content } from './models/Content';
import { Swiper, SwiperSlide } from 'swiper/solid';
import { Principal } from '@dfinity/principal';


let canisterId = Principal.fromText("");

let actor = createActor(canisterId, {
  agentOptions: undefined,
  actorOptions: undefined
});

const [after, setAfter] = createSignal<number | undefined>();

async function fetchFeed(source: boolean, info: { value: Content[] | undefined; refetching: boolean | unknown }): Promise<Content[]> {
  return actor.getFeed(10, after());
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
