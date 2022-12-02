import { Badge } from "@suid/material";
import { createMemo } from "solid-js";
import { gotoPage, Page, savedItems, unreadIndex, unreadItems } from "./Signals";
import ArticleIcon from '@suid/icons-material/Article';
import SettingsIcon from '@suid/icons-material/Settings';
import RssFeedIcon from '@suid/icons-material/RssFeed';



export const manageFeedButton = createMemo(() => {
    return {
        label: "Manage",
        icon: <SettingsIcon />,
        onClick: () => gotoPage(Page.Manage)
    } 
});
export const savedPageButton = createMemo(() => {
    return {
        label: "Saved",
        icon: <Badge badgeContent={savedItems()?.length ?? 0} color="primary">
            <ArticleIcon />
        </Badge>,
        onClick: () => gotoPage(Page.Saved)
    }
});
export const unreadPageButton = createMemo(() => {
    return {
        label: "Unread",
        icon: <Badge badgeContent={(unreadItems()?.length ?? 0) - unreadIndex()} color="primary">
            <RssFeedIcon />
        </Badge>,
        onClick: () => gotoPage(Page.Home)
    }
});