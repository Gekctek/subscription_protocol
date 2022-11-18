import { ActorMethod, ActorSubclass } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { createActor } from "./ActorUtil";
import { ContentIDL, Content } from "./models/Content";

export type FeedItemInfo = {
  channelId: string,
  content: Content,
  hash: number
};

export type Result = [FeedItemInfo];

export interface _SERVICE { 'getFeed': ActorMethod<[number, [bigint] | []], FeedItemInfo[]> }


const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetFeedResult = IDL.Vec(IDL.Record({
    channelId: IDL.Text,
    content: ContentIDL,
    hash: IDL.Nat32
  }));
  return IDL.Service({
    'getFeed': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetFeedResult], [])
  });
};


export const createFeedActor = (canisterId: Principal): ActorSubclass<_SERVICE> => {
  return createActor(canisterId, idlFactory)
};