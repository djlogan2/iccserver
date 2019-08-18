import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// containers
import AppContainer from "../../ui/containers/AppContainer.jsx";
import TestContainer from "../../ui/containers/TestContainer.jsx";
// pages
import SignUpPage from "../../ui/pages/SignupPage";
import LoginPage from "../../ui/pages/LoginPage.jsx";
import RightSideBar from "../../ui/pages/RightSidebar/RightSidebar";

//      <Route path="/right-bar" component={RightSideBar} />
export const renderRoutes = () => (
  <Router>
    <div>
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/login" component={LoginPage} />
      <Route exact={true} path="/" component={AppContainer} />
      <Route exact={true} path="/test/:what" component={TestContainer} />
    </div>
  </Router>
);
