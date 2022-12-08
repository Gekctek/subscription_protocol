import { Badge } from "@suid/material";
import { createMemo } from "solid-js";
import { savedItems, unreadIndex, unreadItems } from "../common/Feed";
import ArticleIcon from '@suid/icons-material/Article';
import SettingsIcon from '@suid/icons-material/Settings';
import RssFeedIcon from '@suid/icons-material/RssFeed';
import { useNavigate } from "@solidjs/router";
import { Page } from "../common/Page";



export const manageFeedButton = () => {
    const navigate = useNavigate();
    return {
        label: "Manage",
        icon: <SettingsIcon />,
        onClick: () => navigate(Page.Manage)
    }
};
export const savedPageButton = () => {
    const navigate = useNavigate();
    return {
        label: "Saved",
        icon: <Badge badgeContent={savedItems()?.length ?? 0} color="primary">
            <ArticleIcon />
        </Badge>,
        onClick: () => navigate(Page.Saved)
    }
};
export const unreadPageButton = () => {
    const navigate = useNavigate();
    return {
        label: "Unread",
        icon: <Badge badgeContent={(unreadItems()?.length ?? 0) - unreadIndex()} color="primary">
            <RssFeedIcon />
        </Badge>,
        onClick: () => navigate(Page.Home)
    }
};