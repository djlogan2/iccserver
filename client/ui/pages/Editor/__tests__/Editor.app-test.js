import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import Editor from "../Editor";

describe("Editor component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <Editor />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
