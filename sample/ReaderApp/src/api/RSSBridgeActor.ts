import { createActor } from "./ActorUtil";
import { ActorMethod } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { Content, ContentIDL } from "./models/Content";
import { rssBridgeCanisterId } from "./CanisterIds";



export type CallbackFunc = [Principal, string];
export type AddRequest = {
    id: string;
    callback: CallbackFunc;
    channels: [string];
};
export type UpdateRequest = {
    id: string;
    callback: [CallbackFunc] | [];
    channels: [{'add': string[]} | {'remove': string[]} | {'set': string[]}] | [];
};
export type DeleteRequest = {
    id: string;
};
export type AddResult = { 'ok': null } | { 'alreadyExists' : null } | {'notAuthenticated': null};
export type UpdateResult = { 'ok': null } | { 'notFound': null } | {'notAuthenticated': null};
export type DeleteResult = { 'ok': null } | { 'notFound': null } | {'notAuthenticated': null};

export type Subscription = {
    id: string,
    channels: string[]
};

export type GetResult = {'ok': Subscription } | { 'notFound': null } | {'notAuthenticated': null};

export interface _SERVICE {
    'getSubscription': ActorMethod<[string], GetResult>,
    'addSubscription': ActorMethod<[AddRequest], AddResult>,
    'updateSubscription': ActorMethod<[UpdateRequest], UpdateResult>,
    'deleteSubscription': ActorMethod<[DeleteRequest], DeleteResult>,
    'push': ActorMethod<[string, Content], void>,
};

const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const DeleteRequest = IDL.Record({
        id: IDL.Text
    });
    const AddResult = IDL.Variant({
        ok: IDL.Null,
        alreadyExists: IDL.Null,
        notAuthenticated: IDL.Null
    });
    let CallbackArg = IDL.Record({
        message: IDL.Variant({
            newContent: ContentIDL,
            changeOwner: IDL.Principal
        }),
        channelId: IDL.Text
    });
    let CallbackResult = IDL.Variant({
        accepted: IDL.Null,
        notAuthorized: IDL.Null
    });
    let Callback = IDL.Func([CallbackArg], [CallbackResult], []);
    let AddRequest = IDL.Record({
        id: IDL.Text,
        callback: Callback,
        channels: IDL.Vec(IDL.Text)
    });
    let Subscription = IDL.Record({
        id: IDL.Text,
        channels: IDL.Vec(IDL.Text),
        callback: Callback
    });
    let GetResult = IDL.Variant({
        ok : Subscription,
        notFound: IDL.Null,
        notAuthenticated: IDL.Null
    });
    let DeleteResult = IDL.Variant({
        ok: IDL.Null,
        notFound: IDL.Null,
        notAuthenticated: IDL.Null
    });
    let UpdateRequest = IDL.Record({
        id: IDL.Text,
        callback: IDL.Opt(Callback),
        channels: IDL.Opt(IDL.Variant({
            add: IDL.Vec(IDL.Text),
            remove: IDL.Vec(IDL.Text),
            set: IDL.Vec(IDL.Text)
        }))
    });
    let UpdateResult = IDL.Variant({
        ok: IDL.Null,
        notFound: IDL.Null,
        notAuthenticated: IDL.Null
    });
    return IDL.Service({
        'getSubscription': IDL.Func([IDL.Text], [GetResult], ["query"]),
        'addSubscription': IDL.Func([AddRequest], [AddResult], []),
        'updateSubscription': IDL.Func([UpdateRequest], [UpdateResult], []),
        'deleteSubscription': IDL.Func([DeleteRequest], [DeleteResult], []),
        'push': IDL.Func([IDL.Text, ContentIDL], [], [])
    });
};

export const RSSBridgeActor = createActor<_SERVICE>(rssBridgeCanisterId, idlFactory);
