import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import LeftSidebar from "../LeftSidebar";

describe("LeftSidebar component", () => {
  const history = createBrowserHistory();
  const wrapper = mount(
    <Router history={history}>
      <LeftSidebar />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(wrapper);
  });
});
