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



async function fetchUnread(feedActorInfo: FeedActorInfo | undefined, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
    if (!feedActorInfo) {
        return [];
    };
    let unreadList = unreadItems();
    // TODO dont always get the full next set?
    sdfsadfsdf
    let lastFeedItem = unreadList ? unreadList[-1] : null;
    let items = await feedActorInfo.actor.getUnread(10, lastFeedItem ? [lastFeedItem.id] : []);
    return items;
};

export const [unreadItems, unreadResource] = createResource(feedActor, fetchUnread);

export const [unreadIndex, setUnreadIndex] = createSignal<number>(0);

async function fetchSaved(feedActorInfo: FeedActorInfo | undefined, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
    if (!feedActorInfo) {
        return [];
    };
    let savedList = savedItems();
    // TODO dont always get the full next set?
    dfasdfsadfasdf
    let lastFeedItem = savedList ? savedList[-1] : null;
    let items = await feedActorInfo.actor.getSaved(10, lastFeedItem ? [lastFeedItem.id] : []);
    return savedList ? savedList.concat(items) : items;
};

export const [savedItems, savedResource] = createResource(feedActor, fetchSaved);


export function nextUnread() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }

    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;
    if (feedItemValue) {
        feedActorInfo.actor.markItemAsRead(feedItemValue.id);
    }

    setUnreadIndex(unreadIndexValue + 1);
};

export function saveItemForLater() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }
    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;

    if (feedItemValue) {
        feedActorInfo.actor.saveItemForLater(feedItemValue);
    }
};

export function deleteSavedItem(id: number) {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }
    feedActorInfo.actor.deleteSavedItem(id);
    let savedItemList = savedItems()?.filter((i) => i.id != id) ?? [];
    savedResource.mutate(savedItemList);
};

export function previousUnread() {
    let unreadIndexValue = unreadIndex();
    if (unreadIndexValue < 1) {
        return;
    }
    setUnreadIndex(unreadIndexValue - 1);
};

export enum Page {
    Home,
    Saved,
    Archive
};

export const [page, setPage] = createSignal<Page>(Page.Home);