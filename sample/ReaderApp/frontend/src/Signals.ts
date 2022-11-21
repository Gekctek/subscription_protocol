import { createResource, createSignal } from "solid-js";
import type { Principal } from "@dfinity/principal";
import { createFeedActor, FeedItemInfo, _SERVICE } from "./api/FeedActor";
import { ReaderApp } from "./api/ReaderAppActor";
import { ActorMethod, ActorSubclass } from "@dfinity/agent";

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



const minItems = 10;

async function fetchUnread(feedActorInfo: FeedActorInfo | undefined, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {

    const unreadItemCount = (info.value?.length ?? 0) - unreadIndex() - 1;
    if (unreadItemCount > minItems) {
        // Optimization: Dont get more if have more than min
        return info.value!;
    }

    return await fetchInternal(feedActorInfo, info, (i) => {
        return i.actor.getUnread
    })
};

export const [unreadItems, unreadResource] = createResource(feedActor, fetchUnread);

export const [unreadIndex, setUnreadIndex] = createSignal<number>(0);

export async function fetchSaved(feedActorInfo: FeedActorInfo | undefined, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
    return fetchInternal(feedActorInfo, info, (i) => {
        return i.actor.getSaved
    });
}
async function fetchInternal(
    feedActorInfo: FeedActorInfo | undefined,
    info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown },
    getFunc: (i: FeedActorInfo) => ActorMethod<[number, [] | [number]], FeedItemInfo[]>
): Promise<FeedItemInfo[]> {
    if (!feedActorInfo) {
        return [];
    };
    let lastFeedItem;
    if (!info.value) {
        lastFeedItem = null;
    } else {
        lastFeedItem = info.value[info.value.length - 1];
    }
    let items = await getFunc(feedActorInfo)(minItems, lastFeedItem ? [lastFeedItem.id] : []);
    if (!info.value) {
        return items;
    }
    return info.value.concat(items);
};

export const [savedItems, savedResource] = createResource(feedActor, fetchSaved);

export const [selectedSavedItem, setSelectedSavedItem] = createSignal<FeedItemInfo | null>(null);


export async function nextUnread() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }

    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;
    setUnreadIndex(unreadIndexValue + 1);

    if (feedItemValue) {
        await feedActorInfo.actor.markItemAsRead(feedItemValue.id);
    }

};

export async function saveItemForLater() {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }
    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;

    if (feedItemValue) {
        // Move from feed to saved
        unreadResource.mutate(unreadList!.filter(u => u.id != feedItemValue!.id))
        feedActorInfo.actor.markItemAsRead(feedItemValue.id);
        feedItemValue.id = -1; // Id is no longer this
        let savedList = savedItems() ?? [];
        savedResource.mutate(savedList.concat([feedItemValue]));
        let response = await feedActorInfo.actor.saveItemForLater(feedItemValue);
        feedItemValue.id = response.ok; // Reset the id to new one
    }
};

export async function deleteSavedItem(id: number) {
    let feedActorInfo = feedActor();
    if (!feedActorInfo) {
        return;
    }
    let savedItemList = savedItems()?.filter((i) => i.id != id) ?? [];
    savedResource.mutate(savedItemList);
    await feedActorInfo.actor.deleteSavedItem(id);
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

export function gotoPage(page: Page) {
    switch (page) {
        case Page.Home:
            if (((unreadItems()?.length ?? 0) - unreadIndex()) < 1) {
                unreadResource.refetch();
            };
            break;
        case Page.Saved:
            if ((savedItems()?.length ?? 0) < 1) {
                savedResource.refetch();
            };
            break;
    };
    setPage(page);
}