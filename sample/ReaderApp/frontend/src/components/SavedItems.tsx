import { Component, Match, Switch, For, createMemo } from 'solid-js';
import { deleteSavedItem, gotoPage, Page, savedItems, savedResource, selectedSavedItem, setSelectedSavedItem, unreadIndex, unreadItems, unreadResource } from '../Signals';
import { Badge, CircularProgress, Divider, Fab, List, ListItem, ListItemButton, ListItemText } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import { ArrowBackIosNew, RssFeed } from '@suid/icons-material';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import End from './EndContent';
import NavWrapper from './NavWrapper';
import Item from './Item';


const SavedItems: Component = () => {
    let backToSavedButton = createMemo(() => {
        return {
            icon: <ArrowBackIosNew />,
            onClick: () => setSelectedSavedItem(null)
        }
    });
    let deleteSavedButton = createMemo(() => {
        return {
            icon: <DeleteIcon />,
            onClick: async () => {
                deleteSavedItem(selectedSavedItem()!.id);
                setSelectedSavedItem(null);
            }
        }
    });
    let refreshButton = createMemo(() => {
        return {
            icon: <RefreshIcon />,
            onClick: () => savedResource.refetch()
        }
    });
    let unreadPageButton = createMemo(() => {
        return {
            icon: <Badge badgeContent={(unreadItems()?.length ?? 0) - unreadIndex()} color="primary">
                <RssFeed />
            </Badge>,
            onClick: () => gotoPage(Page.Home)
        }
    });
    return (
        <Switch>
            <Match when={!!selectedSavedItem()}>
                <NavWrapper
                    navButtons={[
                        backToSavedButton(),
                        deleteSavedButton(),
                        null,
                        null
                    ]}>
                    <Item value={selectedSavedItem()!} />
                </NavWrapper>
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
                                {(item, i) =>
                                    <>
                                        <ListItem disablePadding style={{
                                            "background-color": i() % 2 == 0 ? "inherit" : "rgb(34, 36, 38)"
                                        }}>
                                            <ListItemButton onClick={() => setSelectedSavedItem(item)}>
                                                <div style={{
                                                    display: 'flex',
                                                    'flex-direction': i() % 2 == 0 ? 'row' : 'row-reverse',
                                                    'flex-wrap': 'nowrap',
                                                    'align-items': 'center'
                                                }}>
                                                    <img
                                                        style={{
                                                            "max-width": "150px",
                                                            "max-height": "150px",
                                                            "margin": i() % 2 == 0 ? "0 10px 0 0" : "0 0 0 10px"
                                                        }}
                                                        src={item.content.imageLink}
                                                        alt="Content Image" />
                                                    <div>{item.content.title}</div>
                                                </div>
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