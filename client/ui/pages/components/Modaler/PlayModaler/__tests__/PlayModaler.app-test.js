import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import PlayModaler from "../PlayModaler";

describe("PlayModaler component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <PlayModaler />
    </Router>
  );
  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
