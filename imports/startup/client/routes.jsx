import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "../../ui/pages/Home";
import Play from "../../ui/pages/Play/Play";
import Editor from "../../ui/pages/Editor";
import Examine from "../../ui/pages/Examine";
import Community from "../../ui/pages/Community";
import UserProfile from "../../ui/pages/components/UserManagement/UserProfile";
// pages
import SignUpPage from "../../ui/pages/authentication/SignupPage";
import LoginPage from "../../ui/pages/authentication/LoginPage.jsx";
import {
  RESOURCE_COMMUNITY,
  RESOURCE_EDITOR,
  RESOURCE_EXAMINE,
  RESOURCE_HOME,
  RESOURCE_LOGIN,
  RESOURCE_PLAY, RESOURCE_PROFILE,
  RESOURCE_SIGN_UP
} from "../../constants/resourceConstants";
import NotFound from "../../ui/pages/NotFound/NotFound";

export const Routes = () => (
  <Router>
    <Switch>
      <Route path={RESOURCE_SIGN_UP} component={SignUpPage} />
      <Route path={RESOURCE_LOGIN} component={LoginPage} />
      <Route exact={true} path="/" component={Home} />
      <Route exact={true} path={RESOURCE_HOME} component={Home} />
      <Route exact={true} path={RESOURCE_PLAY} component={Play} />
      <Route exact={true} path={RESOURCE_EDITOR} component={Editor} />
      <Route exact={true} path={RESOURCE_EXAMINE} component={Examine} />
      <Route exact={true} path={RESOURCE_COMMUNITY} component={Community} />
      <Route exact={true} path={RESOURCE_PROFILE} component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);
