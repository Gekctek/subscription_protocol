import './App.css';

import { Component } from 'solid-js';
import LoginPage from './pages/Login';
import ManagePage from './pages/Manage';
import UnreadPage from './pages/Unread';
import SavedPage from './pages/Saved';
import { Route, Routes, useNavigate } from '@solidjs/router';
import { Page } from './common/Page';
import { identity } from './common/Identity';


const App: Component = () => {
  if (!identity()) {
    const navigate = useNavigate();
    navigate(Page.Login);
  }
  return (
    <>
      <Routes>
        <Route path={Page.Home} component={UnreadPage} />
        <Route path={Page.Login} component={LoginPage} />
        <Route path={Page.Manage} component={ManagePage} />
        <Route path={Page.Saved} component={SavedPage} />
      </Routes>
    </>
  );
};

export default App;
