import { Component, createMemo, Match, Show, Switch } from 'solid-js';
import { FeedItemInfo } from '../api/FeedActor';
import { ChannelInfo } from '../api/models/ChannelInfo';
import { Principal } from '@dfinity/principal';
import { unreadIndex, unreadItems, unreadResource, nextUnread, previousUnread, saveItemForLater, Page, setPage, savedResource, savedItems } from '../Signals';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import { Badge, CircularProgress, Fab } from "@suid/material"
import End from './End';
import { Bookmark, RssFeed } from '@suid/icons-material';
import ArrowBackIosNewIcon from '@suid/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@suid/icons-material/ArrowForwardIos';
import NavWrapper, { ButtonInfo } from './NavWrapper';
import Item from './Item';





const Feed: Component = () => {

    const backButton = createMemo(() => {
        if (unreadIndex() < 1 || (unreadItems()?.length ?? 0) < 1) {
            return null;
        }
        return {
            icon: <ArrowBackIosNewIcon />,
            onClick: () => previousUnread()
        }
    });
    const savedPageButton = createMemo(() => {
        return {
            icon: <Badge badgeContent={savedItems()?.length ?? 0} color="primary">
                <ArticleIcon />
            </Badge>,
            onClick: () => setPage(Page.Saved)
        }
    });
    const refreshButton = createMemo(() => {
        return {
            icon: <RefreshIcon />,
            onClick: () => unreadResource.refetch()
        }
    });
    const saveItemButton = createMemo(() => {
        return {
            icon: <Bookmark />,
            onClick: () => saveItemForLater()
        };
    });
    const nextButton = createMemo(() => {
        return {
            icon: <ArrowForwardIosIcon />,
            onClick: () => nextUnread()
        };
    });
    return (
        <Switch>
            <Match when={unreadItems.loading}>
                <div
                    style={{
                        display: 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                        height: '100%'
                    }}>
                    <CircularProgress />
                </div>
            </Match>
            <Match when={(unreadItems()?.length ?? 0) > unreadIndex()}>
                <NavWrapper
                    navButtons={[
                        backButton(),
                        saveItemButton(),
                        nextButton(),
                        savedPageButton()
                    ]}>
                    <Item value={unreadItems()![unreadIndex()]} />
                </NavWrapper>
            </Match>
            <Match when={(unreadItems()?.length ?? 0) < (unreadIndex() + 1)}>
                <NavWrapper
                    navButtons={[
                        backButton(),
                        null,
                        refreshButton(),
                        savedPageButton()
                    ]}>
                    <End
                        name={"Unread"}
                        icon={
                            <RssFeed style={{
                                'font-size': '200px'
                            }} />
                        } />
                </NavWrapper>
            </Match>
        </Switch>

    );
};

export default Feed;