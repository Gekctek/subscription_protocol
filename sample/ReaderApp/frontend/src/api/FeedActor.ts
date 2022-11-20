import { ActorMethod, ActorSubclass } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { createActor } from "./ActorUtil";
import { ContentIDL, Content } from "./models/Content";

export type FeedItem = {
  channelId: string,
  content: Content
};

export type FeedItemInfo = {
  channelId: string,
  content: Content,
  id: number
};


export interface _SERVICE {
  'getUnread': ActorMethod<[number, [number] | []], FeedItemInfo[]>,
  'getSaved': ActorMethod<[number, [number] | []], FeedItemInfo[]>,
  'saveItemForLater': ActorMethod<[FeedItem], void>,
  'deleteSavedItem': ActorMethod<[number], void>,
  'markItemAsRead': ActorMethod<[number], void>
}


const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetResult = IDL.Vec(IDL.Record({
    channelId: IDL.Text,
    content: ContentIDL,
    id: IDL.Nat32
  }));
  const FeedItem = IDL.Record({
    channelId: IDL.Text,
    content: ContentIDL
  });
  return IDL.Service({
    'getUnread': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'getSaved': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetResult], ["query"]),
    'saveItemForLater': IDL.Func([FeedItem], [], []),
    'deleteSavedItem': IDL.Func([IDL.Nat32], [], ["oneway"]),
    'markItemAsRead': IDL.Func([IDL.Nat32], [], ["oneway"]),
  });
};


export const createFeedActor = (canisterId: Principal): ActorSubclass<_SERVICE> => {
  return createActor(canisterId, idlFactory)
};