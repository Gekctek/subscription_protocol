import { Principal } from '@dfinity/principal';


export const appRegistryCanisterId = Principal.fromText(import.meta.env.VITE_APPREGISTRY_CANISTER_ID);
export const contentAppCanisterId = Principal.fromText(import.meta.env.VITE_CONTENTAPP_CANISTER_ID);
export const readerAppCanisterId = Principal.fromText(import.meta.env.VITE_READERAPP_CANISTER_ID);


export const identityProviderUrl = import.meta.env.VITE_IDENTITY_PROVIDER_URL;
export const boundryNodeUrl = import.meta.env.VITE_BOUNDRY_NODE_URL;
