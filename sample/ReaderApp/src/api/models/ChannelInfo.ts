import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

export const ChannelInfoIDL = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'instance': IDL.Principal,
    'description': IDL.Opt(IDL.Text),
});

export interface ChannelInfo {
    'id': string,
    'name': string,
    'instance': Principal,
    'description': string,
};
