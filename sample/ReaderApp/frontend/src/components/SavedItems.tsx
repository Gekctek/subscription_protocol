import { Component, Match, Switch, For } from 'solid-js';
import { deleteSavedItem, Page, savedItems, savedResource, setPage, unreadResource } from '../Signals';
import { CircularProgress, Fab } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import { RssFeed } from '@suid/icons-material';
import RefreshIcon from '@suid/icons-material/Refresh';
import End from './End';


const SavedItems: Component = () => {
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
            <Match when={(savedItems()?.length ?? 0) > 0}>
                <h1>Saved:</h1>
                <For each={savedItems()} >
                    {(item) => <div>
                        <h1>{item.content.title}</h1>
                        <DeleteIcon onClick={() => deleteSavedItem(item.id)} />
                    </div>}
                </For>
            </Match>
            <Match when={(savedItems()?.length ?? 0) < 1}>
                <End name='Saved'
                    buttons={[
                        {
                            icon: <RefreshIcon />,
                            onClick: () => savedResource.refetch()
                        },
                        {
                            icon: <RssFeed />,
                            onClick: () => {
                                unreadResource.refetch();
                                setPage(Page.Home);
                            }
                        }
                    ]} />
            </Match>
        </Switch>

    );
};

export default SavedItems;