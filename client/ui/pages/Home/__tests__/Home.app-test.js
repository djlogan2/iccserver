import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import Home from "../Home";

describe("Home component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <Home />
    </Router>
  );

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
