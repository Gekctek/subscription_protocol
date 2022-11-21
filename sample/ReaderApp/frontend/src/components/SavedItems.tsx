import { Component, Match, Switch, For, createMemo } from 'solid-js';
import { deleteSavedItem, Page, savedItems, savedResource, selectedSavedItem, setPage, setSelectedSavedItem, unreadItems, unreadResource } from '../Signals';
import { Badge, CircularProgress, Divider, Fab, List, ListItem, ListItemButton, ListItemText } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import { RssFeed } from '@suid/icons-material';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import End from './End';
import NavWrapper from './NavWrapper';
import Item from './Item';


const SavedItems: Component = () => {
    let refreshButton = createMemo(() => {
        return {
            icon: <RefreshIcon />,
            onClick: () => savedResource.refetch()
        }
    });
    let unreadPageButton = createMemo(() => {
        return {
            icon: <Badge badgeContent={unreadItems()?.length} color="primary">
                <RssFeed />
            </Badge>,
            onClick: () => setPage(Page.Home)
        }
    });
    return (
        <Switch>
            <Match when={savedItems.loading}>
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
            <Match when={!!selectedSavedItem()}>
                <Item value={selectedSavedItem()!} />
            </Match>
            <Match when={(savedItems()?.length ?? 0) > 0}>
                <NavWrapper
                    navButtons={[
                        null,
                        null,
                        refreshButton(),
                        unreadPageButton()
                    ]}>
                    <>
                        <h1>Saved:</h1>
                        <List>
                            <For each={savedItems()} >
                                {(item) =>
                                    <>
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={() => setSelectedSavedItem(item)}>
                                                <ListItemText primary={item.content.title} />
                                            </ListItemButton>
                                            <ListItemButton onClick={() => deleteSavedItem(item.id)}>
                                                <DeleteIcon />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </>}
                            </For>
                        </List>
                    </>
                </NavWrapper>

            </Match >
            <Match when={(savedItems()?.length ?? 0) < 1}>
                <NavWrapper
                    navButtons={[
                        null,
                        null,
                        refreshButton(),
                        unreadPageButton()
                    ]} >
                    <End
                        name='Saved'
                        icon={
                            <ArticleIcon style={{
                                'font-size': '200px'
                            }} />
                        }
                    />
                </NavWrapper>

            </Match>
        </Switch >

    );
};

export default SavedItems;