import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { renderRoutes } from "../imports/startup/client/routes.jsx";

class App extends React.Component {
  render() {
    <div className="container">
      <renderRoutes />
    </div>;
  }
}
export default App;
