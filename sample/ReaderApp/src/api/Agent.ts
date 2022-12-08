import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import { boundryNodeUrl } from "./CanisterIds";
import { identity } from "./Identity";

export const agent = new HttpAgent({
    host: boundryNodeUrl,
    identity: identity() ?? new AnonymousIdentity()
});