import { ActorMethod, ActorSubclass } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { createActor } from "./ActorUtil";
import { feedCanisterId } from "./CanisterIds";
import { ContentIDL, Content } from "./models/Content";

export type FeedItem = {
  channelId: string,
  content: Content,
  hash: number
};

export type SimpleResult = { 'ok': null } | { 'notRegistered': null };


export interface _SERVICE {
  'getUnread': ActorMethod<[number, [number] | []], FeedItem[]>,
  'getSaved': ActorMethod<[number, [number] | []], FeedItem[]>,
  'saveItemForLater': ActorMethod<[number], SimpleResult>,
  'deleteSavedItem': ActorMethod<[number], SimpleResult>,
  'markItemAsRead': ActorMethod<[number], SimpleResult>
}


const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetResult = IDL.Vec(IDL.Record({
    channelId: IDL.Text,
    content: ContentIDL,
    hash: IDL.Nat32
  }));
  const SimpleResult = IDL.Variant({ ok: IDL.Null, notRegistered: IDL.Null });
  return IDL.Service({
    'getUnread': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'getSaved': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'saveItemForLater': IDL.Func([IDL.Nat32], [SimpleResult], []),
    'deleteSavedItem': IDL.Func([IDL.Nat32], [SimpleResult], []),
    'markItemAsRead': IDL.Func([IDL.Nat32], [SimpleResult], []),
  });
};


export const FeedActor: ActorSubclass<_SERVICE> = createActor(feedCanisterId, idlFactory);