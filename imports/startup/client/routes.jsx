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
import {
  resourceSignUp,
  resourceLogin,
  resourceHome,
  resourcePlay,
  resourceEditor,
  resourceExamine,
  resourceCommunity
} from "../../constants/resourceConstants";

export const Routes = () => (
  <Router>
    <div>
      <Route path={resourceSignUp} component={SignUpPage} />
      <Route path={resourceLogin} component={LoginPage} />
      <Route exact={true} path="/" component={Home} />
      <Route exact={true} path={resourceHome} component={Home} />
      <Route exact={true} path={resourcePlay} component={Play} />
      <Route exact={true} path={resourceEditor} component={Editor} />
      <Route exact={true} path={resourceExamine} component={Examine} />
      <Route exact={true} path={resourceCommunity} component={Community} />
    </div>
  </Router>
);
