import { Fab } from "@suid/material";
import { Component, JSXElement } from "solid-js";



function getYPos(index: number): number {
  return 81 + index * 56;
}

export type SpeedDialItemOptions = {
    label: string,
    visible: boolean,
    index: number,
    icon: JSXElement,
    onClick: () => void
};

const SpeedDialItem: Component<SpeedDialItemOptions> = (props: SpeedDialItemOptions) => {
    return <div style={{
        "pointer-events": props.visible ? "auto" : "none",
        "white-space": "nowrap",
        transition: props.visible ? "250ms" : "300ms",
        transform: "translateY(" + (props.visible ? 0 : getYPos(props.index) + "px") + ")",
        opacity: props.visible ? 1 : 0
      }}>

      <div style={{
        position: "absolute",
        right: "70px",
        top: "20px",
    }}>
        {props.label}
      </div>
      
     <Fab onClick={props.onClick}>
        {props.icon}
    </Fab>

    </div>;
};

export default SpeedDialItem;