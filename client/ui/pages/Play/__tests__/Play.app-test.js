import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import Play from "../Play";

describe("Play component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <Play />
    </Router>
  );

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
