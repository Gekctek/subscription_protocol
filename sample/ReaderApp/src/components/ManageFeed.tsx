import { Component, createMemo, createResource, createSignal, For } from 'solid-js';
import { Badge, Button, List, ListItem, TextField } from "@suid/material"
import NavWrapper from './NavWrapper';
import { RSSBridgeActor, SubscribeRequest } from '../api/RSSBridgeActor';
import { identity } from '../api/Identity';
import { feedCanisterId } from '../api/CanisterIds';
import { Identity } from '@dfinity/agent';



const [feedUrl, setFeedUrl] = createSignal<string | null>(null);

type Subscription = {
    url: string;
};

async function getRssFeeds(identity: Identity | undefined, info: { value: Subscription[] | undefined; refetching: boolean | unknown }): Promise<Subscription[]> {
    let getResult = await RSSBridgeActor.getSubscriptions();
    if ('notSubscribed' in getResult) {
        return [];
    }
    let items = getResult.ok;
    return items;
};

const [rssFeeds, rssFeedResource] = createResource(identity, getRssFeeds);

function subscribe(){
    let feedUrlValue = feedUrl();
    let userId = identity()?.getPrincipal().toString();
    if(!feedUrlValue || !userId){
        return;
    }

    let request : SubscribeRequest = {
        contextId: userId,
        callback: [feedCanisterId, "channelCallback"],
        channels: [feedUrlValue]
    };
    RSSBridgeActor.subscribe(request);
}


const Feed: Component = () => {

    return (
        <NavWrapper quickButtons={[]} speedDialButtons={[]}>
            <TextField
            label="Feed Url"
            value={feedUrl()}
            onChange={(e, v) => {
                setFeedUrl(v);
            }}/>
            <Button onClick={() => subscribe()}>
                Subscribe
            </Button>
            <List>
                <For each={rssFeeds()} >
                    {(f) => 
                        <ListItem>
                            {f.url}
                        </ListItem>
                    }
                </For>
            </List>
        </NavWrapper>

    );
};

export default Feed;