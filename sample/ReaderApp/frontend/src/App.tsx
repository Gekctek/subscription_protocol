import './App.css';

import { Component, Match, Switch } from 'solid-js';
import LoginButton from './components/LoginButton';
import { identity } from './api/Identity';
import Feed from './components/Feed';


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
        <Match when={identity() != null}>
          <Feed />
        </Match>
      </Switch>
    </>
  );
};

export default App;
