import { Menu, MenuItem } from "@suid/material";
import { Component, createSignal, For, JSXElement, Show } from "solid-js";
import FabSpinner from "./FabSpinner";
import SpeedDialItem, { SpeedDialItemOptions } from "./SpeedDialItem";


const [menuAnchor, setMenuAnchor] = createSignal<null | HTMLElement>(null);

const isOpen = () => Boolean(menuAnchor());
const onClose = () => setMenuAnchor(null);

function toggleMenu(el: HTMLButtonElement) {
    if (!!menuAnchor()) {
        setMenuAnchor(null)
    } else {
        setMenuAnchor(el)
    }
}

export type ButtonInfo = {
    label: string,
    icon: JSXElement,
    onClick: () => any;
};

type Props = {
    options: ButtonInfo[]
};

function wrapOnClick(onClick: () => void) {
    onClick();
    onClose();
}

const SpeedDial: Component<Props> = (props: Props) => {
    const anyOptions = props.options.length > 0;
    return (
        <>
            <div style={{
                display: "flex",
                "flex-flow": "column"
            }}>
                <For each={props.options}>
                    {(o, i) =>
                        <div style={{
                            margin: "0 0 20px 0",
                            "pointer-events": "all"
                        }}>
                            <SpeedDialItem
                                icon={o.icon}
                                index={i()}
                                label={o.label}
                                onClick={() => wrapOnClick(o.onClick)}
                                visible={isOpen()} />
                        </div>
                    }
                </For>
                <FabSpinner
                    isOpen={isOpen()}
                    disabled={!anyOptions}
                    onClick={(e) => toggleMenu(e)} />
            </div>

        </>
    );
};

export default SpeedDial;