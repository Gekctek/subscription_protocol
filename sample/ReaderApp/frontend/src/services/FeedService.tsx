import { Content } from "../models/Content";
import { Actor, HttpAgent, ActorMethod, HttpAgentOptions, ActorConfig } from "@dfinity/agent";
import type { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

export interface _SERVICE { 'getFeed': ActorMethod<[number, number?], any> };

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    return IDL.Service({
        'getFeed': IDL.Func(
            [IDL.Nat, IDL.Opt(IDL.Nat32)],
            [IDL.Vec(IDL.Record({
                title: IDL.Text,
                content: IDL.Opt(IDL.Variant({
                    article: IDL.Record({}),
                    image: IDL.Record({}),
                    video: IDL.Record({}),
                    podcast: IDL.Record({}),
                    text: IDL.Record({
                        raw: IDL.Text,
                        html: IDL.Text
                    })
                })),
                link: IDL.Text,
                hash: IDL.Nat32
            }))],
            []
        )
    });
};

export type Options = {
    agentOptions: HttpAgentOptions | undefined,
    actorOptions: ActorConfig | undefined
};

export const createActor = (canisterId: Principal, options: Options): _SERVICE => {
    const agent = new HttpAgent({ ...options?.agentOptions });

    // Fetch root key for certificate validation during development
    if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }
    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};