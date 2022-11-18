import { Principal } from '@dfinity/principal';


export const appRegistryCanisterId = Principal.fromText(import.meta.env.VITE_APPREGISTRY_CANISTER_ID);
export const contentAppCanisterId = Principal.fromText(import.meta.env.VITE_CONTENTAPP_CANISTER_ID);
export const internetIdentityCanisterId = Principal.fromText(import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID);
export const readerAppCanisterId = Principal.fromText(import.meta.env.VITE_READERAPP_CANISTER_ID);
