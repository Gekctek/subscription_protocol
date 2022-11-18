import { createActor } from "./ActorUtil";
import { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { appRegistryCanisterId } from "./CanisterIds";

export interface App {
    'id': string,
    'owners': Array<Principal>,
    'name': string,
    'description': string,
    'getChannelInfo': [Principal, string],
}
export interface ChannelInfo {
    'id': string,
    'name': string,
    'tags': Array<string>,
    'instance': Principal,
    'description': [] | [string],
}
export type GetChannelInfoResult = { 'ok': ChannelInfo } |
{ 'notFound': null };
export type RegistrationResult = { 'ok': null } |
{ 'notAuthorized': null } |
{ 'idAlreadyRegistered': null };
export interface _SERVICE {
    'getChannelInfo': ActorMethod<[string, string], GetChannelInfoResult>,
    'getRegisteredApps': ActorMethod<[], Array<App>>,
    'register': ActorMethod<[App], RegistrationResult>,
}



export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const ChannelInfo = IDL.Record({
        'id': IDL.Text,
        'name': IDL.Text,
        'tags': IDL.Vec(IDL.Text),
        'instance': IDL.Principal,
        'description': IDL.Opt(IDL.Text),
    });
    const GetChannelInfoResult = IDL.Variant({
        'ok': ChannelInfo,
        'notFound': IDL.Null,
    });
    const App = IDL.Record({
        'id': IDL.Text,
        'owners': IDL.Vec(IDL.Principal),
        'name': IDL.Text,
        'description': IDL.Text,
        'getChannelInfo': IDL.Func([IDL.Text], [GetChannelInfoResult], []),
    });
    const RegistrationResult = IDL.Variant({
        'ok': IDL.Null,
        'notAuthorized': IDL.Null,
        'idAlreadyRegistered': IDL.Null,
    });
    return IDL.Service({
        'getChannelInfo': IDL.Func(
            [IDL.Text, IDL.Text],
            [GetChannelInfoResult],
            [],
        ),
        'getRegisteredApps': IDL.Func([], [IDL.Vec(App)], ['query']),
        'register': IDL.Func([App], [RegistrationResult], []),
    });
};

export const AppRegistry = createActor<_SERVICE>(appRegistryCanisterId, idlFactory);
