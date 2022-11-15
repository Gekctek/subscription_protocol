import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface App {
  'signature' : Array<number>,
  'publicKey' : Array<number>,
  'getChannelInfo' : [Principal, string],
}
export interface AppInfo { 'publicKey' : Array<number>, 'name' : string }
export interface ChannelInfo { 'tags' : Array<string>, 'instance' : Principal }
export type GetChannelInfoResult = { 'ok' : ChannelInfo } |
  { 'notFound' : null };
export type RegistrationResult = { 'ok' : null } |
  { 'idAlreadyRegistered' : null };
export interface _SERVICE {
  'getChannelInfo' : ActorMethod<[string, string], GetChannelInfoResult>,
  'getRegisteredApps' : ActorMethod<[], Array<AppInfo>>,
  'register' : ActorMethod<[string, App], RegistrationResult>,
}
