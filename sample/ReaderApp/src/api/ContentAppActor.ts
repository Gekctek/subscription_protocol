import { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { createActor } from './ActorUtil';
import { ChannelInfoIDL, ChannelInfo } from './models/ChannelInfo';
// import { contentAppCanisterId } from './CanisterIds';


// export type CreateChannelResult = { 'created': Principal } |
// { 'idAlreadyRegistered': Principal };
// export type GetChannelInfoResult = { 'ok': ChannelInfo } |
// { 'notFound': null };
// export interface _SERVICE {
//     'createChannel': ActorMethod<
//         [{ 'channelId': string, 'name': string, 'description': [] | [string] }],
//         CreateChannelResult
//     >,
//     'getChannelInfo': ActorMethod<[string], GetChannelInfoResult>,
// }


// const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
//     const CreateChannelResult = IDL.Variant({
//         'created': IDL.Principal,
//         'idAlreadyRegistered': IDL.Principal,
//     });
//     const GetChannelInfoResult = IDL.Variant({
//         'ok': ChannelInfoIDL,
//         'notFound': IDL.Null,
//     });
//     return IDL.Service({
//         'createChannel': IDL.Func(
//             [
//                 IDL.Record({
//                     'channelId': IDL.Text,
//                     'name': IDL.Text,
//                     'description': IDL.Opt(IDL.Text),
//                 }),
//             ],
//             [CreateChannelResult],
//             [],
//         ),
//         'getChannelInfo': IDL.Func([IDL.Text], [GetChannelInfoResult], []),
//     });
// };

// export const ContentApp = createActor<_SERVICE>(contentAppCanisterId, idlFactory);
