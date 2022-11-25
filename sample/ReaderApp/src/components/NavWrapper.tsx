import { Card, Fab } from "@suid/material";
import { Component, For, JSXElement, Show } from "solid-js";

export type ButtonInfo = {
    icon: JSXElement,
    onClick: () => any;
} | null;

type Props = {
    children: JSXElement,
    navButtons: ButtonInfo[]
};

const NavWrapper: Component<Props> = (props: Props) => {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            "flex-direction": 'column'
        }}>
            <div style={{
                "flex-grow": 1,
                "overflow-y": 'auto'
            }}>
                {props.children}
            </div>
            <div style={{
                height: '76px',
                "flex-grow": 0,
                width: '100%',
                display: 'flex',
                "justify-content": 'space-around',
                "align-content": 'center'
            }}>
                <For each={props.navButtons}>
                    {(b) =>
                        <div style={{ "flex-grow": '1', padding: "10px 0 10px 0", display: 'flex', 'justify-content': 'center' }}>
                            <Show when={!!b} fallback={<div style={{ width: '56px' }}></div>}>
                                <Fab onClick={b!.onClick}>
                                    {b!.icon}
                                </Fab>
                            </Show>
                        </div>
                    }
                </For>
            </div >
        </div >

    );
};

export default NavWrapper;