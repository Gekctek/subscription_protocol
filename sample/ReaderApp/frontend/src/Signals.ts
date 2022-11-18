import { createSignal } from "solid-js";
import type { Principal } from "@dfinity/principal";

export const [feedCanisterId, setFeedCanisterId] = createSignal<Principal | null>(null);