import { createResource, createSignal } from "solid-js";
import type { Principal } from "@dfinity/principal";
import { createFeedActor, FeedItemInfo, _SERVICE } from "./api/FeedActor";
import { ReaderApp } from "./api/ReaderAppActor";
import { ActorSubclass } from "@dfinity/agent";

type FeedActorInfo = {
    canisterId: Principal,
    actor: ActorSubclass<_SERVICE>
};

async function getUserFeed(): Promise<FeedActorInfo | undefined> {
    let feedResult = await ReaderApp.getUserFeed();

    if ('ok' in feedResult) {
        let canisterId = feedResult.ok;
        return {
            canisterId: canisterId,
            actor: createFeedActor(canisterId)
        };
    };
    return undefined;
};

export const [feedActor, feedActorResource] = createResource<FeedActorInfo | undefined>(getUserFeed);



async function fetchFeed(feedActorInfo: FeedActorInfo | undefined, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
    if (!feedActorInfo) {
        return [];
    };
    let feedItemList = feedItems();
    let lastFeedItem = feedItemList ? feedItemList[-1] : null;
    let items = await feedActorInfo.actor.getUnread(10, lastFeedItem ? [lastFeedItem.hash] : []);
    return items;
};

export const [feedItems, feedResource] = createResource(feedActor, fetchFeed);

export const [feedIndex, setFeedIndex] = createSignal<number>(0)


export function nextFeedItem() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }

    let feedIndexValue = feedIndex();

    let feedItemList = feedItems();
    let feedItemValue = feedItemList ? feedItemList[feedIndexValue] : null;
    if (feedItemValue) {
        feedActorInfo.actor.markItemAsRead(feedItemValue.hash);
    }

    setFeedIndex(feedIndexValue + 1);
};

export function saveItemForLater() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }
    let feedIndexValue = feedIndex();

    let feedItemList = feedItems();
    let feedItemValue = feedItemList ? feedItemList[feedIndexValue] : null;

    if (feedItemValue) {
        feedActorInfo.actor.saveItemForLater(feedItemValue.hash);
    }
};

export function previousFeedItem() {
    let feedIndexValue = feedIndex();
    if (feedIndexValue < 1) {
        return;
    }
    setFeedIndex(feedIndexValue - 1);
};


