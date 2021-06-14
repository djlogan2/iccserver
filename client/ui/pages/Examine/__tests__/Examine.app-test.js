import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { mount } from "enzyme";
import Examine from "../Examine";

describe("Examine component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <Examine />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  })
});
