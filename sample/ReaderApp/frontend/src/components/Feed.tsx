import { Component, Match, Show, Switch } from 'solid-js';
import { FeedItemInfo } from '../api/FeedActor';
import { ChannelInfo } from '../api/models/ChannelInfo';
import { Principal } from '@dfinity/principal';
import { feedIndex, feedItems, feedResource, nextFeedItem, previousFeedItem, saveItemForLater } from '../Signals';
import Card from './Card';
import Button from '@suid/material/Button';
import Fab from '@suid/material/Fab';
import RefreshIcon from '@suid/icons-material/Refresh';
import { CircularProgress } from "@suid/material"
import WbSunnyIcon from '@suid/icons-material/WbSunny';


type Props = { value: FeedItemInfo, channel: ChannelInfo };


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
        <Switch>
            <Match when={feedItems.loading}>
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
            <Match when={(feedItems()?.length ?? 0) > feedIndex()}>
                <div style={{
                    height: '100%',
                    display: 'flex',
                    "flex-direction": 'column'
                }}>
                    <div style={{
                        "flex-grow": 1,
                        overflow: 'scroll'
                    }}>
                        <Card >
                            <Item
                                value={feedItems()![feedIndex()]}
                                channel={channelMap[feedItems()![feedIndex()]!.channelId]} />
                        </Card>
                    </div>
                    <div style={{
                        height: '50px',
                        "flex-grow": 0,
                        width: '100%'
                    }}>
                        <Button onClick={() => previousFeedItem()}>Back</Button>
                        <Button onClick={() => saveItemForLater()}>Save for Later</Button>
                        <Button onClick={() => nextFeedItem()}>Next</Button>
                    </div>
                </div >
            </Match>
            <Match when={(feedItems()?.length ?? 0) < feedIndex() + 1}>
                <div
                    style={{
                        display: 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                        "flex-flow": 'column',
                        height: '100%'
                    }}>
                    <div>
                        <WbSunnyIcon style={{
                            'font-size': '200px'
                        }} />
                    </div>
                    <div style={{
                        "font-size": '50px'
                    }}>
                        Done.
                    </div>
                    <Fab onClick={() => feedResource.refetch()} style={{
                        margin: '20px'
                    }}>
                        <RefreshIcon />
                    </Fab>
                </div>
            </Match>
        </Switch>

    );
};

export default Feed;