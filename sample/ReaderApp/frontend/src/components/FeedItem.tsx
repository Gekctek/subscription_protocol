import type { Component } from 'solid-js';
import { Content } from '../models/Content';

type FeedInfo = {
    value: Content
};

const FeedItem: Component<FeedInfo> = (props: FeedInfo) => {

    return (
        <div>
            <div>{props.value.title}</div>
            <div>{props.value.body}</div>
        </div>
    );
};

export default FeedItem;