import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { agent } from "./Agent";

export function createActor<T>(canisterId: Principal, idlFactory: IDL.InterfaceFactory, actorOptions?: {}): ActorSubclass<T> {

    // Fetch root key for certificate validation during development
    if (import.meta.env.DFX_NETWORK !== "ic") {
        agent.fetchRootKey().catch((err) => {
            console.warn(
                "Unable to fetch root key. Check to ensure that your local replica is running"
            );
            console.error(err);
        });
    }

    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor<T>(idlFactory, {
        agent,
        canisterId,
        ...actorOptions,
    });
};