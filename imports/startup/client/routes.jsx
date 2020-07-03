import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// containers
// import AppContainer from "../../ui/containers/AppContainer.jsx";

// import TestContainer from "../../ui/containers/TestContainer.jsx";

import Home from "../../ui/pages/Home";
import Play from "../../ui/pages/Play";
import Editor from "../../ui/pages/Editor";
import Examine from "../../ui/pages/Examine";
import Community from "../../ui/pages/Community";
// pages
import SignUpPage from "../../ui/pages/SignupPage";
import LoginPage from "../../ui/pages/LoginPage.jsx";

//      <Route path="/right-bar" component={RightSideBar} />
export const renderRoutes = () => (
  <Router>
    <div>
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/login" component={LoginPage} />
      {/* <Route exact={true} path="/history" component={AppContainer} />
      <Route exact={true} path="/old-play" component={AppContainer} />
      <Route exact={true} path="/mygame" component={AppContainer} />
      <Route exact={true} path="/test/:what" component={TestContainer} /> */}

      {/* REFORMED */}
      {/* <Route exact={true} path="/" component={Home} />
      <Route exact={true} path="/home" component={Home} />
      <Route exact={true} path="/play" component={Play} />
      <Route exact={true} path="/editor" component={Editor} />
      <Route exact={true} path="/examine" component={Examine} /> */}
      <Route exact={true} path="/examine" component={Examine} />
      <Route exact={true} path="/community" component={Community} />
    </div>
  </Router>
);
