import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// containers
import AppContainer from "../../ui/containers/AppContainer.jsx";
import HomeContainer from "../../ui/containers/HomeContainer";
import TestContainer from "../../ui/containers/TestContainer.jsx";
import Editor from "../../ui/pages/Editor";
// pages
import SignUpPage from "../../ui/pages/SignupPage";
import LoginPage from "../../ui/pages/LoginPage.jsx";


//      <Route path="/right-bar" component={RightSideBar} />
export const renderRoutes = () => (
  <Router>
    <div>
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/login" component={LoginPage} />
      <Route exact={true} path="/" component={HomeContainer} />
      <Route exact={true} path="/home" component={HomeContainer} />
      <Route exact={true} path="/history" component={AppContainer} />
      <Route exact={true} path="/editor" component={Editor} />
      <Route exact={true} path="/play" component={AppContainer} />
      <Route exact={true} path="/mygame" component={AppContainer} />
      <Route exact={true} path="/test/:what" component={TestContainer} />
    </div>
  </Router>
);
