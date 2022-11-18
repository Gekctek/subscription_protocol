import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import { identity } from "./Identity";

export const agent = new HttpAgent({
    host: "http://localhost:4943", // TODO config
    identity: identity() ?? new AnonymousIdentity()
});