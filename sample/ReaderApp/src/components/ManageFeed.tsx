import { Component, createMemo, createSignal } from 'solid-js';
import { Badge, Button, TextField } from "@suid/material"
import NavWrapper from './NavWrapper';
import { RSSBridgeActor, SubscribeRequest } from '../api/RSSBridgeActor';
import { identity } from '../api/Identity';
import { feedCanisterId } from '../api/CanisterIds';



const [feedUrl, setFeedUrl] = createSignal<string | null>(null);

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
        <NavWrapper navButtons={[null, null, null, null]}>
            <TextField
            label="Feed Url"
            value={feedUrl()}
            onChange={(e, v) => {
                setFeedUrl(v);
            }}/>
            <Button onClick={() => subscribe()}>
                Subscribe
            </Button>
        </NavWrapper>

    );
};

export default Feed;