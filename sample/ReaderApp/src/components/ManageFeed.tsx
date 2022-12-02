import { Component, createMemo, createResource, createSignal, For } from 'solid-js';
import { Badge, Button, List, ListItem, TextField } from "@suid/material"
import NavWrapper from './NavWrapper';
import { RSSBridgeActor, AddRequest, Subscription } from '../api/RSSBridgeActor';
import { identity } from '../api/Identity';
import { feedCanisterId } from '../api/CanisterIds';
import { Identity } from '@dfinity/agent';



const [feedUrl, setFeedUrl] = createSignal<string | null>(null);

const [subId, setSubId] = createSignal("Feed1");


async function getSubscription(identity: Identity | undefined, info: { value: Subscription | null | undefined; refetching: boolean | unknown }): Promise<Subscription | null> {
    let getResult = await RSSBridgeActor.getSubscription(subId());
    if('notFound' in getResult) {
        return null;
    }
    return getResult.ok;
};

const [subscription, subscriptionResource] = createResource(identity, getSubscription);

async function subscribe(){
    let feedUrlValue = feedUrl();
    if(!feedUrlValue){
        return;
    }
    let subscriptionValue = subscription();
    if(!subscriptionValue) {
        let request : AddRequest  = {
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
                <For each={subscription()?.channels} >
                    {(f) => 
                        <ListItem>
                            {f}
                        </ListItem>
                    }
                </For>
            </List>
        </NavWrapper>

    );
};

export default Feed;