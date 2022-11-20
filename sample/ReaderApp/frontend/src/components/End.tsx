
import WbSunnyIcon from '@suid/icons-material/WbSunny';
import { Fab } from '@suid/material';
import { Component, For, JSXElement } from 'solid-js';

type ButtonInfo = {
    icon: JSXElement,
    onClick: () => any;
};

type Props = {
    name: string,
    buttons: ButtonInfo[]
};

const End: Component<Props> = (props: Props) => {

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
                <WbSunnyIcon style={{
                    'font-size': '200px'
                }} />
            </div>
            <div style={{
                "font-size": '50px'
            }}>
                No More {props.name}.
            </div>
            <div>
                <For each={props.buttons}>
                    {(b) => <Fab onClick={b.onClick} style={{
                        margin: '20px'
                    }}>
                        {b.icon}
                    </Fab>
                    }
                </For>
            </div>
        </div>

    );
};

export default End;