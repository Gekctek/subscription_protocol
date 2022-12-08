import { AuthClient } from "@dfinity/auth-client";
import { Navigator } from "@solidjs/router";
import { createSignal } from "solid-js";
import { identityProviderUrl } from "../api/CanisterIds";
import { Page } from "./Page";

export const authClient = await AuthClient.create();

let currentIdentity = authClient.getIdentity();

export const [identity, setIdentity] = createSignal(currentIdentity.getPrincipal().isAnonymous() ? null : currentIdentity);

export const [isRegistered, setIsRegistered] = createSignal(true);

export async function login(navigator: Navigator) {
    await authClient.login({
        onSuccess() {
            let identity = authClient.getIdentity();
            setIdentity(identity);
            navigator(Page.Home);
        },
        identityProvider: identityProviderUrl,
        maxTimeToLive: BigInt(30) * BigInt(24) * BigInt(3_600_000_000_000), // 30 days
        onError(e) {
            alert("Failed login\n" + JSON.stringify(e)); // TODO
        }
    })
}
export async function logout(navigator: Navigator) {
    setIdentity(null);
    await authClient.logout();
    navigator(Page.Login);
}