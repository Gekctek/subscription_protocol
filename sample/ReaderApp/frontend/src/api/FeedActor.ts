import { ActorMethod, ActorSubclass } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { createActor } from "./ActorUtil";
import { ContentIDL, Content } from "./models/Content";

export type FeedItemInfo = {
  channelId: string,
  content: Content,
  id: number
};

export type Result = [FeedItemInfo];

export interface _SERVICE {
  'getUnread': ActorMethod<[number, [number] | []], FeedItemInfo[]>
  'saveItemForLater': ActorMethod<[number], void>,
  'markItemAsRead': ActorMethod<[number, boolean], void>
}


const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetUnreadResult = IDL.Vec(IDL.Record({
    channelId: IDL.Text,
    content: ContentIDL,
    id: IDL.Nat32
  }));
  return IDL.Service({
    'getUnread': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetUnreadResult], ["query"]),
    'saveItemForLater': IDL.Func([IDL.Nat32], [], ["oneway"]),
    'markItemAsRead': IDL.Func([IDL.Nat32, IDL.Bool], [], ["oneway"]),
  });
};


export const createFeedActor = (canisterId: Principal): ActorSubclass<_SERVICE> => {
  return createActor(canisterId, idlFactory)
};