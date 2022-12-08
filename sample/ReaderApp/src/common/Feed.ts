import { createResource, createSignal } from "solid-js";
import { ActorMethod } from "@dfinity/agent";
import { FeedActor, FeedItem, GetResult } from "../api/FeedActor";
import { setIsRegistered } from "./Identity";


export const [unreadIndex, setUnreadIndex] = createSignal<number>(0);


export const [unreadItems, unreadResource] = createResource(fetchUnread);

export const [allUnreadItemsRetrieved, setAllUnreadItemsRetrieved] = createSignal(false);


export const [savedItems, savedResource] = createResource(fetchSaved);


async function fetchUnread(b: boolean | null, info: { value: FeedItem[] | undefined; refetching: boolean | FetchOptions }): Promise<FeedItem[]> {
    return await fetchItems(info, FeedActor.getUnread)
};

export async function fetchSaved(b: boolean | undefined, info: { value: FeedItem[] | undefined; refetching: boolean | FetchOptions }): Promise<FeedItem[]> {
    return fetchItems(info, FeedActor.getSaved);
}



export type FetchOptions = {
    clearItems: boolean;
};

export async function fetchItems(
    info: { value: FeedItem[] | undefined; refetching: boolean | FetchOptions },
    apiCall: ActorMethod<[number, [] | [number]], GetResult>
): Promise<FeedItem[]> {

    let clearItems = false;
    if(typeof info.refetching !== 'boolean') {
        clearItems = info.refetching.clearItems;
    }
    let currentItems = clearItems ? [] : info.value;

    let lastFeedItem;
    if (currentItems === undefined || currentItems.length < 1) {
        lastFeedItem = null;
    } else {
        lastFeedItem = currentItems[currentItems.length - 1];
    }
    const minItems = 10;
    let getResult = await apiCall(minItems, lastFeedItem ? [lastFeedItem.hash] : []);
    if ('notRegistered' in getResult) {
        setIsRegistered(false);
        return [];
    }
    setIsRegistered(true);
    let items = getResult.ok;

    let gotMaxItems = items.length >= minItems;
    setAllUnreadItemsRetrieved(!gotMaxItems);


    if (!lastFeedItem) {
        return items;
    }

    return currentItems!.concat(items);
};