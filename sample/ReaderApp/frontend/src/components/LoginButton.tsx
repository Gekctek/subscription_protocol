import { AnonymousIdentity } from '@dfinity/agent';
import { Component, Match, Switch } from 'solid-js';
import { internetIdentityCanisterId } from '../api/CanisterIds';
import { createFeedActor } from '../api/FeedActor';
import { authClient, identity, setIdentity } from '../api/Identity';
import { ReaderApp } from '../api/ReaderAppActor';
import { feedCanisterId, setFeedCanisterId } from '../Signals';

async function login() {
    await authClient.login({
        onSuccess() {
            let identity = authClient.getIdentity();
            setIdentity(identity);
        },
        identityProvider: `http://localhost:4943?canisterId=${internetIdentityCanisterId.toText()}`
    })
}
async function logout() {
    setIdentity(null);
    await authClient.logout();
}

const LoginButton: Component = () => {

    return (
        <Switch fallback={<div>Not Found</div>}>
            <Match when={identity() == null}>
                <button onClick={() => login()}>Login</button>
            </Match>
            <Match when={identity() != null}>
                <button onClick={() => logout()}>Logout</button>
                <div style={{ display: "none" }}>Feed: {feedCanisterId()?.toText()}</div>
            </Match>
        </Switch>);
};

export default LoginButton;


