import { AuthClient } from "@dfinity/auth-client";
import { createSignal } from "solid-js";

export const authClient = await AuthClient.create();

let currentIdentity = authClient.getIdentity();

export const [identity, setIdentity] = createSignal(currentIdentity.getPrincipal().isAnonymous() ? null : currentIdentity);