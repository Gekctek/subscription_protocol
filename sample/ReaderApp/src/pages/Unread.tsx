import { Component, createMemo, createSignal, Match, Show, Suspense, Switch } from 'solid-js';
import RefreshIcon from '@suid/icons-material/Refresh';
import End from '../components/EndContent';
import { Bookmark, RssFeed } from '@suid/icons-material';
import NavWrapper from '../components/NavWrapper';
import Item from '../components/Item';
import { logoutButton, manageFeedButton, savedPageButton } from '../components/CommonButtons';
import { FeedActor, FeedItem } from '../api/FeedActor';
import Swiper, { FeedItemWithIndex, SwiperStore } from '../components/Swiper';
import { allUnreadItemsRetrieved, savedItems, savedResource, setUnreadIndex, unreadIndex, unreadItems, unreadResource } from '../common/Feed';
import { CircularProgress } from '@suid/material';



const [triggered, setTriggered] = createSignal(false);

let readItemsCache = new Set<number>();

const Unread: Component = () => {

    const refreshButton = createMemo(() => {
        return {
            label: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => unreadResource.refetch({
                clearItems: true
            })
        }
    });
    const saveItemButton = createMemo(() => {
        return {
            label: "Save",
            icon: <Bookmark />,
            onClick: () => saveItemForLater()
        };
    });

    const currentItem = createMemo(() => {
        let unreadItemsValue = unreadItems() ?? [];
        let unreadIndexValue = unreadIndex();
        if (unreadItemsValue.length > unreadIndexValue) {
            return unreadItemsValue[unreadIndexValue]
        }
        return null;
    });

    const quickButtons = createMemo(() => {
        let currentItemValue = currentItem();
        if (currentItemValue != null) {
            // If not at end of feed
            return [
                saveItemButton()
            ];
        }
        let endOfFeedButtons = [
            savedPageButton()
        ];
        return endOfFeedButtons;
    });

    const speedDialButtons = createMemo(() => {
        let currentItemValue = currentItem();
        if (currentItemValue != null) {
            return [
                refreshButton(),
                manageFeedButton(),
                savedPageButton(),
                logoutButton()
            ];
        }
        return [
            refreshButton(),
            manageFeedButton(),
            logoutButton()
        ];
    });

    const renderSlide = (item: FeedItem, index: number) => {
        return <Item value={item} />
    };
    const swiperStore: SwiperStore = {
        items: unreadItems,
        allItemsRetrieved: allUnreadItemsRetrieved,
        triggerGetMore: () => {
            // Refetch if not already getting more
            if (!triggered()) {
                setTriggered(true);
                let result = unreadResource.refetch({
                    clearItems: false
                }) as Promise<FeedItem[]>;
                if (!!result) {
                    result
                        .then(() => {
                            setTriggered(false);
                        });
                }
                else {
                    setTriggered(false);
                }
            }
        }
    };

    const onChange = (newItem: FeedItemWithIndex | undefined, previousItem: FeedItemWithIndex | undefined) => {
        if (!previousItem) {
            return;
        }

        let forward = !newItem || newItem?.index > previousItem?.index;
        if (!forward) {
            return;
        }
        if (!readItemsCache.has(previousItem.hash)) {
            // Optimization, only mark as read once
            readItemsCache.add(previousItem.hash);
            FeedActor.markItemAsRead(previousItem.hash)
                // TODO
                .catch((e) => console.log(`Failed to mark item '${previousItem.hash}' as read: ` + e));
        }
    };
    let loadingComponent = (
        <div style={{
            width: "100%",
            display: "flex",
            height: "100%",
            "justify-content": "center",
            "align-items": "center"
        }}>
            <CircularProgress size={100} />
        </div>
    );
    return (
        <Show when={!!unreadItems()} fallback={loadingComponent}>
            <NavWrapper
                quickButtons={quickButtons()}
                speedDialButtons={speedDialButtons()}>
                <Swiper
                    store={swiperStore}
                    renderSlide={renderSlide}
                    onChange={onChange}
                    endSlide={<End
                        name={"No more unread"}
                        icon={<RssFeed style={{ 'font-size': '200px' }} />} />}
                />
            </NavWrapper>
        </Show>
    );
};

export default Unread;



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
        FeedActor.saveItemForLater(feedItemValue.hash)
            // TODO
            .catch((e) => console.log(`Failed to save item '${feedItemValue!.hash}': ` + e));
    }
};
export function previousUnread() {
    let unreadIndexValue = unreadIndex();
    if (unreadIndexValue < 1) {
        return;
    }
    setUnreadIndex(unreadIndexValue - 1);
};
