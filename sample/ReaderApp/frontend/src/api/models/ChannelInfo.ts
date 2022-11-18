import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

export const ChannelInfoIDL = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'tags': IDL.Vec(IDL.Text),
    'instance': IDL.Principal,
    'description': IDL.Opt(IDL.Text),
});

export interface ChannelInfo {
    'id': string,
    'name': string,
    'tags': Array<string>,
    'instance': Principal,
    'description': string,
};
