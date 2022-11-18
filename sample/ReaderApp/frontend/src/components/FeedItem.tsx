import { Component, Show } from 'solid-js';
import { FeedItemInfo } from '../api/FeedActor';
import { ChannelInfo } from '../api/models/ChannelInfo';

type Props = { value: FeedItemInfo, channel: ChannelInfo };

const FeedItem: Component<Props> = (props: Props) => {

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

export default FeedItem;