import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import AppWrapper from "../AppWrapper";

describe("AppWrapper component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <AppWrapper />
    </Router>
  );

  it("should render", () => {
    chai.assert.equal(component);
  });
});
