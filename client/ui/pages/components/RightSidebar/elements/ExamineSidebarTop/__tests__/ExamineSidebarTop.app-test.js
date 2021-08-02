import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import ExamineSidebarTop from "../ExamineSidebarTop";

describe("ExamineSidebarTop component", () => {
  it("should render", () => {
    const history = createBrowserHistory();

    const component = mount(
      <Router history={history}>
        <ExamineSidebarTop />
      </Router>
    );

    chai.assert.isDefined(component);
  });
});
