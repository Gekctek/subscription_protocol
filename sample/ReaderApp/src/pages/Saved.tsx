import { Component, Match, Switch, For, createMemo, createSignal, createResource, Show } from 'solid-js';
import { Divider, List, ListItem, ListItemButton } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import { ArrowBackIosNew } from '@suid/icons-material';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import End from '../components/EndContent';
import NavWrapper from '../components/NavWrapper';
import Item from '../components/Item';
import { logoutButton, manageFeedButton, unreadPageButton } from '../components/CommonButtons';
import { FeedActor, FeedItem } from '../api/FeedActor';
import { savedItems, savedResource } from '../common/Feed';



const Saved: Component = () => {

    const [selectedSavedItem, setSelectedSavedItem] = createSignal<FeedItem | null>(null);

    let backToSavedButton = createMemo(() => {
        return {
            label: "Back",
            icon: <ArrowBackIosNew />,
            onClick: () => setSelectedSavedItem(null)
        }
    });
    let deleteSavedButton = createMemo(() => {
        return {
            label: "Delete",
            icon: <DeleteIcon />,
            onClick: async () => {
                deleteSavedItem(selectedSavedItem()!.hash);
                setSelectedSavedItem(null);
            }
        }
    });
    let refreshButton = createMemo(() => {
        return {
            label: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => savedResource.refetch()
        }
    });
    const speedDialButtons = () => {
        return [
            refreshButton(),
            manageFeedButton(),
            logoutButton()
        ]
    }
    return (
        <Switch>
            <Match when={!!selectedSavedItem()}>
                <NavWrapper
                    quickButtons={[
                        backToSavedButton(),
                        deleteSavedButton()
                    ]}
                    speedDialButtons={speedDialButtons()}>
                    <Item value={selectedSavedItem()!} />
                </NavWrapper>
            </Match>
            <Match when={(savedItems()?.length ?? 0) > 0}>
                <NavWrapper
                    quickButtons={[
                        unreadPageButton()
                    ]}
                    speedDialButtons={speedDialButtons()}>
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
                                                    <Show when={item.content.imageLink.length > 0}>
                                                        <img
                                                            style={{
                                                                "max-width": "150px",
                                                                "max-height": "150px",
                                                                "margin": i() % 2 == 0 ? "0 10px 0 0" : "0 0 0 10px"
                                                            }}
                                                            src={item.content.imageLink[0]}
                                                            alt="Content Image" />
                                                    </Show>
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
                    quickButtons={[
                        unreadPageButton()
                    ]}
                    speedDialButtons={speedDialButtons()}>
                    <End
                        name='No more saved'
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

export default Saved;



export async function deleteSavedItem(hash: number) {
    let savedItemList = savedItems()?.filter((i) => i.hash != hash) ?? [];
    savedResource.mutate(savedItemList);
    await FeedActor.deleteSavedItem(hash);
};