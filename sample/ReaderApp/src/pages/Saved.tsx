import { Component, Match, Switch, For, createMemo } from 'solid-js';
import { deleteSavedItem, gotoPage, Page, savedItems, savedResource, selectedSavedItem, setSelectedSavedItem, unreadIndex, unreadItems, unreadResource } from '../Signals';
import { Badge, Divider, List, ListItem, ListItemButton } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import { ArrowBackIosNew } from '@suid/icons-material';
import RefreshIcon from '@suid/icons-material/Refresh';
import ArticleIcon from '@suid/icons-material/Article';
import End from '../components/EndContent';
import NavWrapper from '../components/NavWrapper';
import Item from '../components/Item';
import { unreadPageButton } from '../CommonButtons';


const Saved: Component = () => {
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
    return (
        <Switch>
            <Match when={!!selectedSavedItem()}>
                <NavWrapper
                    quickButtons={[
                        backToSavedButton(),
                        deleteSavedButton()
                    ]}
                    speedDialButtons={[]}>
                    <Item value={selectedSavedItem()!} />
                </NavWrapper>
            </Match>
            <Match when={(savedItems()?.length ?? 0) > 0}>
                <NavWrapper
                    quickButtons={[
                        refreshButton(),
                        unreadPageButton()
                    ]}
                    speedDialButtons={[]}>
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
                                                        src={item.content.imageLink[0]}
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
                    quickButtons={[
                        refreshButton(),
                        unreadPageButton()
                    ]}
                    speedDialButtons={[]}>
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

export default Saved;