import { createResource, createSignal } from "solid-js";
import { FeedActor, FeedItem, GetResult, _SERVICE } from "./api/FeedActor";
import { ActorMethod } from "@dfinity/agent";
import { Navigator } from "@solidjs/router";


const minItems = 10;


export const [unreadIndex, setUnreadIndex] = createSignal<number>(0);

export const [isRegistered, setIsRegistered] = createSignal(true);

async function fetchUnread(b: boolean | null, info: { value: FeedItem[] | undefined; refetching: boolean | unknown }): Promise<FeedItem[]> {

    const unreadItemCount = (info.value?.length ?? 0) - unreadIndex() - 1;
    if (unreadItemCount > minItems) {
        // Optimization: Dont get more if have more than min
        return info.value!;
    }
    if (unreadItemCount < 1) {
        setUnreadIndex(0);
        info.value = [];
    }

    return await fetchInternal(info, FeedActor.getUnread)
};


export const [unreadItems, unreadResource] = createResource(fetchUnread);

export async function fetchSaved(b: boolean | undefined, info: { value: FeedItem[] | undefined; refetching: boolean | unknown }): Promise<FeedItem[]> {
    return fetchInternal(info, FeedActor.getSaved);
}
async function fetchInternal(
    info: { value: FeedItem[] | undefined; refetching: boolean | unknown },
    apiCall: ActorMethod<[number, [] | [number]], GetResult>
): Promise<FeedItem[]> {
    let lastFeedItem;
    if (!info.value) {
        lastFeedItem = null;
    } else {
        lastFeedItem = info.value[info.value.length - 1];
    }
    let getResult = await apiCall(minItems, lastFeedItem ? [lastFeedItem.hash] : []);
    if ('notRegistered' in getResult) {
        setIsRegistered(false);
        return [];
    }
    setIsRegistered(true);
    let items = getResult.ok;
    if (!info.value || !lastFeedItem) {
        return items;
    }
    return info.value.concat(items);
};

export const [savedItems, savedResource] = createResource(fetchSaved);

export const [selectedSavedItem, setSelectedSavedItem] = createSignal<FeedItem | null>(null);


export async function nextUnread() {

    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;
    setUnreadIndex(unreadIndexValue + 1);

    if (feedItemValue) {
        await FeedActor.markItemAsRead(feedItemValue.hash);
    }

};

export async function saveItemForLater() {
    let unreadIndexValue = unreadIndex();

    let unreadList = unreadItems();
    let feedItemValue = unreadList ? unreadList[unreadIndexValue] : null;

    if (feedItemValue) {
        // Move from feed to saved
        unreadResource.mutate(unreadList!.filter(u => u.hash != feedItemValue!.hash))
        FeedActor.markItemAsRead(feedItemValue.hash);
        let savedList = savedItems() ?? [];
        savedResource.mutate(savedList.concat([feedItemValue]));
        let response = await FeedActor.saveItemForLater(feedItemValue.hash);
    }
};

export async function deleteSavedItem(hash: number) {
    let savedItemList = savedItems()?.filter((i) => i.hash != hash) ?? [];
    savedResource.mutate(savedItemList);
    await FeedActor.deleteSavedItem(hash);
};

export function previousUnread() {
    let unreadIndexValue = unreadIndex();
    if (unreadIndexValue < 1) {
        return;
    }
    setUnreadIndex(unreadIndexValue - 1);
};

export enum Page {
    Home = "/",
    Saved = "/saved",
    Manage = "/manage",
    Login = "/login",
};



export function gotoPage(navigate: Navigator, page: Page) {
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
        default:
            break;
    };
    navigate(page);
}