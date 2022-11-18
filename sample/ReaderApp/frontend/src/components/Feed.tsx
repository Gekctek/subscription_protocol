import { Component, createResource, createSignal, For, Show } from 'solid-js';
import { createFeedActor, FeedItemInfo } from '../api/FeedActor';
import { ChannelInfo } from '../api/models/ChannelInfo';
import { Principal } from '@dfinity/principal';
import { feedCanisterId, setFeedCanisterId, setLoading } from '../Signals';
import { ReaderApp } from '../api/ReaderAppActor';
import Card from './Card';
import Button from '@suid/material/Button';
import { Fab } from "@suid/material";
import RefreshIcon from "@suid/icons-material/Refresh";


type Props = { value: FeedItemInfo, channel: ChannelInfo };


const [after, setAfter] = createSignal<bigint | null>(null);

function getNext(saveForLater: boolean) {
    setItemIndex(itemIndex() + 1);
};


const [itemIndex, setItemIndex] = createSignal<number>(0);

async function fetchFeed(canisterId: Principal, info: { value: FeedItemInfo[] | undefined; refetching: boolean | unknown }): Promise<FeedItemInfo[]> {
    setItemIndex(0);
    setLoading(true);
    let afterValue = after();
    let actor = createFeedActor(canisterId);
    let items = await actor.getFeed(10, afterValue ? [afterValue] : []);
    setLoading(false);
    return items;
};

export const [feedItems, feedResource] = createResource(feedCanisterId, fetchFeed);

async function getOrCreateFeed() {
    let feedResult = await ReaderApp.getOrCreateFeed();
    let feed;
    if ('created' in feedResult) {
        feed = feedResult.created;
    } else {
        feed = feedResult.exists;
    };
    setFeedCanisterId(feed);
}

await getOrCreateFeed(); // TODO

const Item: Component<Props> = (props: Props) => {

    return (
        <div style={{
            height: "100%",
            "text-align": "start",
            padding: "20px"
        }}>
            <div style={{
                "font-size": "24px",
                margin: "0 0 8px 0"
            }}>
                <a href={props.value.content.link}>
                    {props.value.content.title}
                </a>
            </div>
            <div style={{
                "font-size": "13px",
                color: "rgb(152, 144, 130)",
                margin: "0 0 8px 0"
            }}>
                <a href='#' style={{
                    color: "#6f6f6f"
                }}>
                    {props.channel.name}
                </a>
                <span>{props.value.content.date}</span>
            </div>

            <Show when={props.value.content.imageLink}>
                <div style={{
                    margin: "0 0 8px 0"
                }}>
                    <img src={props.value.content.imageLink} alt="Content Image" />
                </div>
            </Show>
            <div style={{}}>
                <div>{props.value.content.description}</div>
            </div>
        </div >
    );
};

const Feed: Component = () => {

    let channelMap: Record<string, ChannelInfo> = {
        "1": {
            id: "1",
            name: "Channel 1",
            description: "The best channel",
            instance: Principal.anonymous(),
            tags: []
        },
        "2": {
            id: "2",
            name: "Channel 2",
            description: "The 2nd best channel",
            instance: Principal.anonymous(),
            tags: []
        }
    }; // TODO
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            "flex-direction": 'column'
        }}>
            <Show when={feedItems()}>
                <div style={{
                    "flex-grow": 1,
                    overflow: 'scroll'
                }}>
                    <Card >
                        <Item
                            value={feedItems()![itemIndex()]!}
                            channel={channelMap[feedItems()![itemIndex()]!.channelId]} />
                    </Card>
                </div>
            </Show>
            <div style={{
                height: '50px',
                "flex-grow": 0,
                width: '100%'
            }}>
                <Button onClick={() => getNext(true)}>Save for Later</Button>
                <Button onClick={() => getNext(false)}>Next</Button>
                <Fab color='primary' aria-label='refresh' onClick={() => feedResource.refetch()}>
                    <RefreshIcon />
                </Fab>
            </div>
        </div >
    );
};

export default Feed;