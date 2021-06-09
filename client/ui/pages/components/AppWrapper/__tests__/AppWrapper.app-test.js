import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import AppWrapper from "../AppWrapper";
import { configure, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { Router } from "react-router-dom";

configure({ adapter: new Adapter() });
describe("AppWrapper", () => {
  const history = createBrowserHistory();
  const wrapper = mount(
    <Router history={history}>
      <AppWrapper />
    </Router>
  );

  it("render component", () => {
    chai.assert.isDefined(wrapper);
  });

  it("should have one div", () => {
    chai.assert.equal(wrapper.find("div").length, 1);
  });
});
