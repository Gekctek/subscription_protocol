import { Component, JSXElement } from 'solid-js';


type Props = {
    name: string,
    icon: JSXElement
};

const EndContent: Component<Props> = (props: Props) => {

    return (
        <div
            style={{
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                "flex-flow": 'column',
                height: '100%'
            }}>
            <div>
                {props.icon}
            </div>
            <div style={{
                "font-size": '50px'
            }}>
                {props.name}
            </div>
        </div>
    );
};

export default EndContent;