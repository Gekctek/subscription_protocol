import { ActorMethod } from "@dfinity/agent";
import { IDL } from '@dfinity/candid';


export type Result = [{
  'title': string,
  'content': { 'article': {} }
  | { 'article': {} }
  | { 'image': {} }
  | { 'video': {} }
  | { 'podcast': {} }
  | { 'text': { 'raw': string } | { 'html': string } },
  'link': string,
  'hash': number
}];

export interface _SERVICE { 'getFeed': ActorMethod<[number, [bigint] | []], Result> }

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const GetFeedResult = IDL.Vec(IDL.Record({
    title: IDL.Text,
    content: IDL.Opt(IDL.Variant({
      article: IDL.Record({}),
      image: IDL.Record({}),
      video: IDL.Record({}),
      podcast: IDL.Record({}),
      text: IDL.Variant({
        raw: IDL.Text,
        html: IDL.Text
      })
    })),
    link: IDL.Text,
    hash: IDL.Nat32
  }));
  return IDL.Service({
    'getFeed': IDL.Func([IDL.Nat, IDL.Opt(IDL.Nat32)], [GetFeedResult], [])
  });
};