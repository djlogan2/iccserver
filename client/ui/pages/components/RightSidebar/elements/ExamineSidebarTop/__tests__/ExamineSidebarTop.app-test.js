import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import ExamineSidebarTop from "../ExamineSidebarTop";
import CssManager from "../../../../Css/CssManager";

describe("ExamineSidebarTop component", () => {
  it("should render", () => {
    const history = createBrowserHistory();

    const component = mount(
      <Router history={history}>
        <ExamineSidebarTop cssManager={new CssManager({}, {})} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
