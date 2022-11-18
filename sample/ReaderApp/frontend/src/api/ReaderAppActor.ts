import { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { createActor } from './ActorUtil';
import { readerAppCanisterId } from './CanisterIds';

export type Result = { 'created': Principal } |
{ 'exists': Principal };
export interface _SERVICE {
    'getOrCreateFeed': ActorMethod<[], Result>,
    'upgradeFeeds': ActorMethod<[], undefined>,
}
const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const Result = IDL.Variant({
        'created': IDL.Principal,
        'exists': IDL.Principal,
    });
    return IDL.Service({
        'getOrCreateFeed': IDL.Func([], [Result], []),
        'upgradeFeeds': IDL.Func([], [], []),
    });
};


export const ReaderApp = createActor<_SERVICE>(readerAppCanisterId, idlFactory);