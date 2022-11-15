import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Result = { 'created' : Principal } |
  { 'idAlreadyRegistered' : Principal };
export interface _SERVICE { 'createFeed' : ActorMethod<[string], Result> }
