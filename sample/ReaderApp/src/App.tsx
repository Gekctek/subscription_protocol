import './App.css';

import { Component } from 'solid-js';
import LoginPage from './pages/Login';
import ManagePage from './pages/Manage';
import UnreadPage from './pages/Unread';
import SavedPage from './pages/Saved';
import { Route, Routes } from '@solidjs/router';

const App: Component = () => {
  return (
    <>
      <Routes>
        <Route path="/" component={UnreadPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/manage" component={ManagePage} />
        <Route path="/saved" component={SavedPage} />
      </Routes>
    </>
  );
};

export default App;
