import { Component, createMemo, createResource, createSignal, For } from 'solid-js';
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, TextField } from "@suid/material"
import DeleteIcon from "@suid/icons-material/Delete"
import NavWrapper from '../components/NavWrapper';
import { RSSBridgeActor, AddRequest, Subscription } from '../api/RSSBridgeActor';
import { feedCanisterId } from '../api/CanisterIds';
import LaunchIcon from '@suid/icons-material/Launch';
import { savedPageButton, unreadPageButton } from '../components/CommonButtons';
import { RssFeed } from '@suid/icons-material';



const [feedUrl, setFeedUrl] = createSignal<string | null>(null);

const [subId, setSubId] = createSignal("Feed1");


async function getSubscription(b: boolean | undefined, info: { value: Subscription | null | undefined; refetching: boolean | unknown }): Promise<Subscription | null> {
    let getResult = await RSSBridgeActor.getSubscription(subId());
    if ('notFound' in getResult || 'notAuthenticated' in getResult) {
        return null;
    }
    return getResult.ok;
};

const [subscription, subscriptionResource] = createResource(getSubscription);

async function subscribe() {
    let feedUrlValue = feedUrl();
    if (!feedUrlValue) {
        return;
    }
    let subscriptionValue = subscription();
    if (!subscriptionValue) {
        let request: AddRequest = {
            id: subId(),
            callback: [feedCanisterId, "channelCallback"],
            channels: [feedUrlValue]
        };
        subscriptionResource.mutate({
            id: subId(),
            channels: [feedUrlValue]
        })
        await RSSBridgeActor.addSubscription(request);
    } else {
        subscriptionResource.mutate({
            ...subscriptionValue,
            channels: [...subscriptionValue.channels, feedUrlValue]
        })
        await RSSBridgeActor.updateSubscription({
            id: subId(),
            callback: [],
            channels: [{ add: [feedUrlValue] }]
        })
    }
}

async function removeChannel(channelId: string) {
    let subscriptionValue = subscription();
    if (!subscriptionValue) {
        return;
    }
    subscriptionResource.mutate({
        ...subscriptionValue,
        channels: subscriptionValue.channels.filter(c => c != channelId)
    })
    await RSSBridgeActor.updateSubscription({
        id: subId(),
        callback: [],
        channels: [{ remove: [channelId] }]
    })
}


const Manage: Component = () => {

    var quickButtons = createMemo(() => {
        return [
            unreadPageButton()
        ];
    });

    var speedDialButtons = createMemo(() => {
        return [
            savedPageButton()
        ];
    });
    const onSearchSiteClick = () => {
        window.open(`https://feedsearch.dev/api/v1/search?result=true&url=${feedUrl()}`, "_blank")
    }
    return (
        <NavWrapper quickButtons={quickButtons()} speedDialButtons={speedDialButtons()}>
            <div>
                <div style={{
                    margin: "40px 20px 20px 20px"
                }}>
                    <TextField
                        fullWidth={true}
                        label="Url"
                        variant='outlined'
                        value={feedUrl()}
                        onChange={(e, v) => {
                            setFeedUrl(v);
                        }} />
                </div>
                <div style={{
                    display: 'flex',
                    'justify-content': 'space-evenly',
                    'align-items': 'center',
                    margin: "0 0 40px 0"
                }}>
                    <Button
                        variant="contained"
                        onClick={() => subscribe()} disabled={!feedUrl()}>
                        Subscribe to Feed Url
                    </Button>
                    <div>OR</div>
                    <Button
                        variant="contained"
                        onClick={onSearchSiteClick}
                        disabled={!feedUrl()}>
                        Search URL for feeds <LaunchIcon fontSize='small' style={{ margin: "0 0 0 10px" }} />
                    </Button></div>
                <List >
                    <For each={subscription()?.channels} >
                        {(f) =>
                            <ListItem secondaryAction={<IconButton>
                                <DeleteIcon onClick={() => removeChannel(f)} />
                            </IconButton>}>
                                <ListItemAvatar >
                                    <Avatar variant='rounded'>
                                        <RssFeed />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={f} />
                            </ListItem>
                        }
                    </For>
                </List>
            </div>
        </NavWrapper>

    );
};

export default Manage;