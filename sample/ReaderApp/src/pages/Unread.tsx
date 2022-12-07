import { Component, createMemo } from 'solid-js';
import { unreadIndex, unreadItems, unreadResource, saveItemForLater } from '../Signals';
import RefreshIcon from '@suid/icons-material/Refresh';
import End from '../components/EndContent';
import { Bookmark, RssFeed, BookmarkAdded } from '@suid/icons-material';
import NavWrapper from '../components/NavWrapper';
import Item from '../components/Item';
import { manageFeedButton, savedPageButton } from '../CommonButtons';
import { FeedItem } from '../api/FeedActor';
import Swiper from '../components/Swiper';



const refreshButton = createMemo(() => {
    return {
        label: "Refresh",
        icon: <RefreshIcon />,
        onClick: () => unreadResource.refetch()
    }
});
const saveItemButton = createMemo(() => {
    return {
        label: "Save",
        icon: <Bookmark />,
        onClick: () => saveItemForLater()
    };
});


const Unread: Component = () => {
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
            refreshButton(),
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
                savedPageButton()
            ];
        }
        return [
            manageFeedButton()
        ];
    });

    const renderSlide = (item: FeedItem, index: number) => {
        return <Item value={item} />
    };

    return (
        <NavWrapper
            quickButtons={quickButtons()}
            speedDialButtons={speedDialButtons()}>
            <Swiper
                resource={[unreadItems, unreadResource]}
                renderSlide={renderSlide}
                endSlide={<End
                    name={"Unread"}
                    icon={<RssFeed style={{ 'font-size': '200px' }} />} />}
            />
        </NavWrapper>
    );
};

export default Unread;