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
        identityProvider: `http://localhost:4943?canisterId=${internetIdentityCanisterId.toText()}`,
        maxTimeToLive: BigInt(30) * BigInt(24) * BigInt(3_600_000_000_000), // 30 days
        onError(e) {
            alert("Failed login\n" + JSON.stringify(e)); // TODO
        }
    })
}
export async function logout() {
    setIdentity(null);
    await authClient.logout();
}