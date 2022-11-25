import { createActor } from "./ActorUtil";
import { ActorMethod } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { ContentIDL } from "./models/Content";


export type Post = {
    title: string,
    description: string,
    body: string
};

export type CallbackFunc = [Principal, string];

export type SubscribeResult = { 'ok': null };
export type UnsubscribeResult = { 'ok': null } | { 'notSubscribed': null };

export interface _SERVICE {
    'subscribe': ActorMethod<[CallbackFunc, {}], SubscribeResult>,
    'unsubscribe': ActorMethod<[], UnsubscribeResult>,
    'publish': ActorMethod<[Post], void>
};

const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const SubscribeResult = IDL.Variant({
        ok: IDL.Null
    });
    const UnsubscribeResult = IDL.Variant({
        ok: IDL.Null,
        notSubscribed: IDL.Null
    });
    let callbackArgIdl = IDL.Record({
        message: IDL.Variant({
            newContent: ContentIDL,
            changeOwner: IDL.Principal
        }),
        channelId: IDL.Text
    });
    let callbackResult = IDL.Variant({
        accepted: IDL.Null,
        notAuthorized: IDL.Null
    });
    let callbackIdl = IDL.Func([callbackArgIdl], [callbackResult], []);
    let optionsIdl = IDL.Record({});
    let postIdl = IDL.Record({
        title: IDL.Text,
        description: IDL.Text,
        body: IDL.Text
    });
    return IDL.Service({
        'subscribe': IDL.Func([callbackIdl, optionsIdl], [SubscribeResult], []),
        'unsubscribe': IDL.Func([], [UnsubscribeResult], []),
        'publish': IDL.Func([postIdl], [], [])
    });
};

export const createChannelActor = (cannisterId: Principal) => createActor<_SERVICE>(cannisterId, idlFactory);
