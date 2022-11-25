import { createActor } from "./ActorUtil";
import { ActorMethod } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { ContentIDL } from "./models/Content";
import { rssBridgeCanisterId } from "./CanisterIds";



export type CallbackFunc = [Principal, string];
export type SubscribeRequest = {
    contextId: string;
    callback: CallbackFunc;
    channels: [string];
}
export type SubscribeResult = { 'ok': null };
export type UnsubscribeResult = { 'ok': null } | { 'notSubscribed': null };

export interface _SERVICE {
    'subscribe': ActorMethod<[SubscribeRequest], SubscribeResult>,
    'unsubscribe': ActorMethod<[string], UnsubscribeResult>,
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
    let SubscribeRequest = IDL.Record({
        contextId: IDL.Text,
        callback: callbackIdl,
        channels: IDL.Vec(IDL.Text)
    });
    return IDL.Service({
        'subscribe': IDL.Func([SubscribeRequest], [SubscribeResult], []),
        'unsubscribe': IDL.Func([IDL.Text], [UnsubscribeResult], [])
    });
};

export const RSSBridgeActor = createActor<_SERVICE>(rssBridgeCanisterId, idlFactory);
