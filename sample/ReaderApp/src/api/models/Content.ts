import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export const AuthorIDL = IDL.Variant({
  name: IDL.Text,
  identity: IDL.Principal,
  handle: IDL.Text
});

export const ContentIDL = IDL.Record({
  title: IDL.Text,
  body: IDL.Opt(IDL.Record({
    format: IDL.Opt(IDL.Text),
    value: IDL.Text
  })),
  link: IDL.Text,
  authors: IDL.Vec(AuthorIDL),
  imageLink: IDL.Opt(IDL.Text),
  language: IDL.Opt(IDL.Text),
  date: IDL.Int
});



export type Author = { name: string } | {  identity: Principal } | {  handle: string };


export type Content = {
  title: string,
  body: {
    format: [string] | [],
    value: string
  },
  link: string,
  authors: Author[],
  imageLink: [string] | [],
  language: [string] | [],
  date: number,
};