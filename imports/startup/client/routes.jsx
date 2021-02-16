import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import SignUpPage from "../../ui/pages/authentication/SignupPage";
import LoginPage from "../../ui/pages/authentication/LoginPage.jsx";
import DeveloperContainer from "../../ui/containers/DeveloperContainer";
import DeveloperContainer2 from "../../ui/containers/DeveloperContainer2";
import { RESOURCE_LOGIN, RESOURCE_SIGN_UP } from "../../constants/resourceConstants";
import NotFound from "../../ui/pages/NotFound/NotFound";
import EnhancedRoute from "./EnhancedRoute";
import routesWithRoles from "./routesWithRoles";

export const Routes = ({ currentRoles }) => {
  const routes = routesWithRoles.map((route, index) => (
    <EnhancedRoute exact {...route} availableRoles={currentRoles} key={index} />
  ));

  return (
    <Router>
      <Switch>
        <Route path={RESOURCE_SIGN_UP} component={SignUpPage} />
        <Route path={RESOURCE_LOGIN} component={LoginPage} />
        <Route exact={true} path="/developer" component={DeveloperContainer} /> */}
        <Route exact={true} path="/developer2" component={DeveloperContainer2} /> */}
        {routes}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};
