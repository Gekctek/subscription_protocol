
import WbSunnyIcon from '@suid/icons-material/WbSunny';
import { Fab } from '@suid/material';
import { Component, For, JSXElement } from 'solid-js';
import NavWrapper, { ButtonInfo } from './NavWrapper';


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
                0 {props.name}
            </div>
        </div>
    );
};

export default EndContent;