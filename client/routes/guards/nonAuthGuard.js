import React from "react";
import { Route, Redirect } from "react-router-dom";
import { RESOURCE_HOME } from "../../constants/resourceConstants";

const NonAuthGuard = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (!auth ? <Component {...props} /> : <Redirect to={RESOURCE_HOME} />)}
  />
);

export default NonAuthGuard;
