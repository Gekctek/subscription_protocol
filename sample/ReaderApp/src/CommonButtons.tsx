import { Badge } from "@suid/material";
import { createMemo } from "solid-js";
import { gotoPage, Page, savedItems, unreadIndex, unreadItems } from "./Signals";
import ArticleIcon from '@suid/icons-material/Article';
import SettingsIcon from '@suid/icons-material/Settings';
import RssFeedIcon from '@suid/icons-material/RssFeed';
import { useNavigate } from "@solidjs/router";



export const manageFeedButton = () => {
    const navigate = useNavigate();
    return {
        label: "Manage",
        icon: <SettingsIcon />,
        onClick: () => {
            gotoPage(navigate, Page.Manage);
        }
    } 
};
export const savedPageButton = () => {
    const navigate = useNavigate();
    return {
        label: "Saved",
        icon: <Badge badgeContent={savedItems()?.length ?? 0} color="primary">
            <ArticleIcon />
        </Badge>,
        onClick: () => gotoPage(navigate, Page.Saved)
    }
};
export const unreadPageButton = () => {
    const navigate = useNavigate();
    return {
        label: "Unread",
        icon: <Badge badgeContent={(unreadItems()?.length ?? 0) - unreadIndex()} color="primary">
            <RssFeedIcon />
        </Badge>,
        onClick: () => gotoPage(navigate, Page.Home)
    }
};