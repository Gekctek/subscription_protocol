import { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { createActor } from './ActorUtil';
import { feedCanisterId } from './CanisterIds';

// export type GetResult = { 'ok': Principal } |
// { 'notFound': null } |
// { 'notAuthenticated': null };

// export type CreateResult = { 'ok': Principal } |
// { 'notAuthenticated': null };


// export interface _SERVICE {
//     'getUserFeed': ActorMethod<[], GetResult>,
//     'createUserFeed': ActorMethod<[], CreateResult>,
//     'upgradeFeeds': ActorMethod<[], undefined>,
// }
// const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
//     const GetResult = IDL.Variant({
//         'ok': IDL.Principal,
//         'notFound': IDL.Null,
//         'notAuthenticated': IDL.Null
//     });
//     const CreateResult = IDL.Variant({
//         'ok': IDL.Principal,
//         'notAuthenticated': IDL.Null
//     });
//     return IDL.Service({
//         'getUserFeed': IDL.Func([], [GetResult], ["query"]),
//         'createUserFeed': IDL.Func([], [CreateResult], []),
//         'upgradeFeeds': IDL.Func([], [], []),
//     });
// };


// export const ReaderApp = createActor<_SERVICE>(readerAppCanisterId, idlFactory);