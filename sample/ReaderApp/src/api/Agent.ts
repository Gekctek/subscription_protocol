import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import { identity } from "../common/Identity";
import { boundryNodeUrl } from "./CanisterIds";

export const agent = new HttpAgent({
    host: boundryNodeUrl,
    identity: identity() ?? new AnonymousIdentity()
});