import { Principal } from '@dfinity/principal';


export const feedCanisterId = Principal.fromText(import.meta.env.VITE_FEED_CANISTER_ID);


export const identityProviderUrl = import.meta.env.VITE_IDENTITY_PROVIDER_URL;
export const boundryNodeUrl = import.meta.env.VITE_BOUNDRY_NODE_URL;
