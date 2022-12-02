import { Component, createMemo, Match, Switch } from 'solid-js';
import { unreadIndex, unreadItems, unreadResource, nextUnread, previousUnread, saveItemForLater, Page, gotoPage, savedResource, savedItems, deleteSavedItem } from '../Signals';
import RefreshIcon from '@suid/icons-material/Refresh';
import { Badge } from "@suid/material"
import End from '../components/EndContent';
import { Bookmark, RssFeed, BookmarkAdded } from '@suid/icons-material';
import ArrowBackIosNewIcon from '@suid/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@suid/icons-material/ArrowForwardIos';
import NavWrapper from '../components/NavWrapper';
import Item from '../components/Item';
import {manageFeedButton, savedPageButton} from '../CommonButtons';



const backButton = createMemo(() => {
    return {
        label: "Back",
        icon: <ArrowBackIosNewIcon />,
        onClick: () => previousUnread()
    }
});
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
const nextButton = createMemo(() => {
    return {
        label: "Next",
        icon: <ArrowForwardIosIcon />,
        onClick: () => nextUnread()
    };
});


const Unread: Component = () => {

    var currentItem = createMemo(() => {
        let unreadItemsValue = unreadItems() ?? [];
        let unreadIndexValue = unreadIndex();
        if(unreadItemsValue.length  > unreadIndexValue) {
            return unreadItemsValue[unreadIndexValue]
        }
        return null;
    });

    var quickButtons = createMemo(() => {
        let currentItemValue = currentItem();
        if(currentItemValue != null) {
            // If not at end of feed
            return [
                backButton(),
                saveItemButton(),
                nextButton()
            ];
        }
        let endOfFeedButtons = [
            refreshButton(),
            savedPageButton()
        ];
        if(!!unreadItems()?.length) {
            // If can go back, add back button
            endOfFeedButtons.unshift(backButton())
        }
        return endOfFeedButtons;
    });

    var speedDialButtons = createMemo(() => {
        let currentItemValue = currentItem();
        if(currentItemValue != null) {
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

    var content = createMemo(() => {
        let currentItemValue = currentItem();
        if(currentItemValue != null) {
            return <Item value={currentItemValue} />
        }
        return <End
            name={"Unread"}
            icon={<RssFeed style={{ 'font-size': '200px' }} />} />
    });

    return (
        <NavWrapper
            quickButtons={quickButtons()}
            speedDialButtons={speedDialButtons()}>
                {content()}
        </NavWrapper>
    );
};

export default Unread;