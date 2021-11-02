import React from "react";
import { Redirect, Route } from "react-router-dom";
import { RESOURCE_LOGIN } from "../../constants/resourceConstants";
import { ROLE_DEVELOPER } from "../../constants/systemConstants";

const AuthGuard = ({ component: Component, auth, currentRoles, roles, ...rest }) => {
  const suitableRoles = [];

  if (currentRoles.includes(ROLE_DEVELOPER)) {
    suitableRoles.push(ROLE_DEVELOPER);
  }

  if (roles && roles.length) {
    roles.forEach((role) => {
      if (currentRoles.includes(role)) suitableRoles.push(role);
    });
  }

  const canViewPage = auth && (!roles?.length || suitableRoles.length);

  return (
    <Route
      {...rest}
      render={(props) =>
        canViewPage ? <Component {...props} /> : <Redirect to={RESOURCE_LOGIN} />
      }
    />
  );
};

export default AuthGuard;
