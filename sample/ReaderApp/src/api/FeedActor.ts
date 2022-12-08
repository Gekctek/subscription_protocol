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

export type GetResult = { ok: FeedItem[] } | { 'notRegistered': null };

export type SimpleResult = { 'ok': null } | { 'notRegistered': null };

export type SaveResult =  SimpleResult | {'alreadyExists': null}

type UserDataInfo = {
  unread: number[];
  saved: number[];
};

export interface _SERVICE {
  'getUsers': ActorMethod<[], UserDataInfo[]>,
  'getUnread': ActorMethod<[number, [number] | []], GetResult>,
  'getSaved': ActorMethod<[number, [number] | []], GetResult>,
  'saveItemForLater': ActorMethod<[number], SaveResult>,
  'deleteSavedItem': ActorMethod<[number], SimpleResult>,
  'markItemAsRead': ActorMethod<[number], SimpleResult>
}


const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetResult = IDL.Variant({
    ok: IDL.Vec(IDL.Record({
      channelId: IDL.Text,
      content: ContentIDL,
      hash: IDL.Nat32
    })),
    notRegistered: IDL.Null
  });
  const SimpleResult = IDL.Variant({ ok: IDL.Null, notRegistered: IDL.Null });
  const SaveResult = IDL.Variant({ ok: IDL.Null, notRegistered: IDL.Null, alreadyExists: IDL.Null });
  const UserDataInfo = IDL.Record({
    unread: IDL.Vec(IDL.Nat32),
    saved: IDL.Vec(IDL.Nat32)
  })
  return IDL.Service({
    'getUsers': IDL.Func([], [IDL.Vec(UserDataInfo)], []),
    'getUnread': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'getSaved': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'saveItemForLater': IDL.Func([IDL.Nat32], [SaveResult], []),
    'deleteSavedItem': IDL.Func([IDL.Nat32], [SimpleResult], []),
    'markItemAsRead': IDL.Func([IDL.Nat32], [SimpleResult], []),
  });
};


export const FeedActor: ActorSubclass<_SERVICE> = createActor(feedCanisterId, idlFactory);