import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Home from "../../ui/pages/Home";
import Play from "../../ui/pages/Play";
import Editor from "../../ui/pages/Editor";
import Examine from "../../ui/pages/Examine";
import Community from "../../ui/pages/Community";
// pages
import SignUpPage from "../../ui/pages/authentication/SignupPage";
import LoginPage from "../../ui/pages/authentication/LoginPage.jsx";

export const renderRoutes = () => (
  <Router>
    <div>
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/login" component={LoginPage} />
      <Route exact={true} path="/" component={Home} />
      <Route exact={true} path="/home" component={Home} />
      <Route exact={true} path="/play" component={Play} />
      <Route exact={true} path="/editor" component={Editor} />
      <Route exact={true} path="/examine" component={Examine} />
      <Route exact={true} path="/community" component={Community} />
    </div>
  </Router>
);
