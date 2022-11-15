import { Actor, HttpAgent, ActorConfig, HttpAgentOptions } from "@dfinity/agent";
import type { Principal } from '@dfinity/principal';
import { idlFactory, _SERVICE } from "./FeedInstance.did";

export const createActor = (canisterId: Principal, options: { agentOptions?: HttpAgentOptions; actorOptions?: ActorConfig }): _SERVICE => {
  const agent = new HttpAgent(options ? { ...options.agentOptions } : {});

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...(options ? options.actorOptions : {}),
  });
};
