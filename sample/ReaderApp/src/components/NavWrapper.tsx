import { Card, Fab } from "@suid/material";
import { Component, createMemo, createSignal, For, JSXElement, Show } from "solid-js";
import SpeedDial, { ButtonInfo } from "./SpeedDial";


type ButtonOptions = {
    children: JSXElement
};
const ButtonWrapper: Component<ButtonOptions> = (props: ButtonOptions) => {
    return (
        <div style={{ "flex-grow": '1', padding: "10px 0 10px 0", display: 'flex', 'justify-content': 'center' }}>
            {props.children}
        </div>
    );
};

type Props = {
    children: JSXElement,
    quickButtons: ButtonInfo[],
    speedDialButtons: ButtonInfo[]
};
const NavWrapper: Component<Props> = (props: Props) => {
    return (
        <div style={{
            height: '100%',
        }}>
            <div style={{
                height: '100%',
                "overflow-y": 'auto',
                'margin-bottom': '76px'
            }}>
                {props.children}
            </div>
            <div style={{
                'max-width': '600px',
                position: 'fixed',
                bottom: 0,
                width: '100%',
                display: 'flex',
                "justify-content": 'space-around',
                "align-content": 'center',
                "align-items": "flex-end"
            }}>
                <For each={props.quickButtons}>
                    {(b) =>
                        <ButtonWrapper>
                            <Fab onClick={b.onClick}>
                                {b.icon}
                            </Fab>
                        </ButtonWrapper>
                    }
                </For>
                <Show when={props.speedDialButtons.length > 0}>
                    <ButtonWrapper>
                        <SpeedDial options={props.speedDialButtons}/>
                    </ButtonWrapper>
                </Show>
            </div >
        </div >

    );
};

export default NavWrapper;