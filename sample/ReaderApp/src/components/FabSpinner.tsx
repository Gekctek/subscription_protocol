import { Component } from "solid-js";
import CloseIcon from "@suid/icons-material/Close";
import { Fab } from "@suid/material";

type Props = {
    isOpen: boolean,
    disabled?: boolean,
    onClick: (e: HTMLButtonElement) => void
};

const FabSpinner: Component<Props> = (props: Props) => {

    return <Fab
      onClick={(e) => props.onClick(e.currentTarget)}
      disabled={props.disabled}>

      <div style={{
        transition: "all 250ms",
        transform: "rotate(" + (props.isOpen ? 0 : "-45deg") + ")",
        display: "flex"
      }}>
        <CloseIcon/>
      </div>

    </Fab>;
};

export default FabSpinner;