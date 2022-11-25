import './App.css';

import { Component, Match, Switch } from 'solid-js';
import LoginButton from './components/LoginButton';
import { identity } from './api/Identity';
import Feed from './components/Feed';
import { isRegistered, page, Page } from './Signals';
import SavedItems from './components/SavedItems';
import ManageFeed from './components/ManageFeed';


const App: Component = () => {
  return (
    <>
      <Switch fallback={<div>Oops...</div>}>
        <Match when={identity() == null}>
          <div
            style={{
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              height: '100%'
            }}>
            <LoginButton />
          </div>
        </Match>
        <Match when={!isRegistered()}>
          <div
            style={{
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              height: '100%'
            }}>
            <ManageFeed />
          </div>
        </Match>
        <Match when={identity() != null}>
          <Switch>
            <Match when={page() == Page.Home}>
              <Feed />
            </Match>
            <Match when={page() == Page.Saved}>
              <SavedItems />
            </Match>
          </Switch>
        </Match>
      </Switch>
    </>
  );
};

export default App;
