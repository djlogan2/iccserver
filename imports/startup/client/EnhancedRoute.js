import React from "react";
import { Route, Redirect } from "react-router-dom";
import { RESOURCE_LOGIN } from "../../constants/resourceConstants";

const EnhancedRoute = ({ availableRoles, roles, path, component, ...rest }) => {
  const suitableRoles = [];

  if (roles && roles.length) {
    roles.forEach(role => {
      if (availableRoles.includes(role)) suitableRoles.push(role);
    });
  } else {
    suitableRoles.push(roles);
  }

  if (suitableRoles.length) {
    return <Route path={path} component={component} {...rest} />;
  }

  return <Redirect to={RESOURCE_LOGIN} />;
};

export default EnhancedRoute;
