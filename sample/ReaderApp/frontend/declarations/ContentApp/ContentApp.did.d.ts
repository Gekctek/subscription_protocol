import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ChannelInfo { 'tags' : Array<string>, 'instance' : Principal }
export type CreateChannelResult = { 'created' : Principal } |
  { 'idAlreadyRegistered' : Principal };
export type GetChannelInfoResult = { 'ok' : ChannelInfo } |
  { 'notFound' : null };
export type RegistrationResult = { 'ok' : null } |
  { 'idAlreadyRegistered' : null };
export interface _SERVICE {
  'createChannel' : ActorMethod<[string], CreateChannelResult>,
  'getChannelInfo' : ActorMethod<[string], GetChannelInfoResult>,
  'register' : ActorMethod<[string, Principal], RegistrationResult>,
}
