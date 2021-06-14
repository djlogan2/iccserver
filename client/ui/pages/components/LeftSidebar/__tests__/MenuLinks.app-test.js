import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import MenuLinks from "../MenuLinks";

describe("MenuLinks component", () => {
  const history = createBrowserHistory();
  const wrapper = mount(
    <Router history={history}>
      <MenuLinks />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(wrapper);
  });
});
