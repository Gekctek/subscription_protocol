import { AuthClient } from "@dfinity/auth-client";
import { createSignal } from "solid-js";
import { internetIdentityCanisterId } from "./CanisterIds";

export const authClient = await AuthClient.create();

let currentIdentity = authClient.getIdentity();

export const [identity, setIdentity] = createSignal(currentIdentity.getPrincipal().isAnonymous() ? null : currentIdentity);


export async function login() {
    await authClient.login({
        onSuccess() {
            let identity = authClient.getIdentity();
            setIdentity(identity);
        },
        identityProvider: `http://localhost:4943?canisterId=${internetIdentityCanisterId.toText()}`
    })
}
export async function logout() {
    setIdentity(null);
    await authClient.logout();
}