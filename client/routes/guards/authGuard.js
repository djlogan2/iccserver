import React from "react";
import { Redirect, Route } from "react-router-dom";
import { RESOURCE_LOGIN } from "../../constants/resourceConstants";
import { ROLE_DEVELOPER } from "../../constants/systemConstants";
import AppWrapper from "../../../client/ui/pages/components/AppWrapper/AppWrapper";

const AuthGuard = ({
  component: Component,
  auth,
  currentRoles,
  roles,
  withAppWrapper,
  ...rest
}) => {
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
      render={(props) => {
        if (canViewPage) {
          return withAppWrapper ? (
            <AppWrapper>
              <Component {...props} />
            </AppWrapper>
          ) : (
            <Component {...props} />
          );
        } else {
          return <Redirect to={RESOURCE_LOGIN} />;
        }
      }}
    />
  );
};

export default AuthGuard;
