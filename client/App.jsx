import React from "react";

import { renderRoutes } from "../imports/startup/client/routes.jsx";

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <renderRoutes />
      </div>
    );
  }
}

export default App;
