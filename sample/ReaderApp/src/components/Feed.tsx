import { Component, createMemo, Match, Switch } from 'solid-js';
import { unreadIndex, unreadItems, unreadResource, nextUnread, previousUnread, saveItemForLater, Page, gotoPage, savedResource, savedItems, deleteSavedItem } from '../Signals';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import { Badge } from "@suid/material"
import End from './EndContent';
import { Bookmark, RssFeed, BookmarkAdded } from '@suid/icons-material';
import ArrowBackIosNewIcon from '@suid/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@suid/icons-material/ArrowForwardIos';
import SettingsIcon from '@suid/icons-material/Settings';
import NavWrapper from './NavWrapper';
import Item from './Item';



const backButton = createMemo(() => {
    return {
        label: "Back",
        icon: <ArrowBackIosNewIcon />,
        onClick: () => previousUnread()
    }
});
const manageFeedButton = createMemo(() => {
    return {
        label: "Manage",
        icon: <SettingsIcon />,
        onClick: () => gotoPage(Page.Manage)
    } 
});
const savedPageButton = createMemo(() => {
    return {
        label: "Saved",
        icon: <Badge badgeContent={savedItems()?.length ?? 0} color="primary">
            <ArticleIcon />
        </Badge>,
        onClick: () => gotoPage(Page.Saved)
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


const Feed: Component = () => {

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
            return [
                backButton(),
                saveItemButton(),
                nextButton()
            ];
        }
        return [
            backButton(),
            refreshButton()
        ];
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
            backButton(),
            refreshButton()
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

export default Feed;