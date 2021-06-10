import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import SignupPage from "../SignupPage";
import { configure, mount } from "enzyme";
import { Router } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

describe("SignupPage", () => {
  const history = createBrowserHistory();
  const wrapper = mount(
    <Router history={history}>
      <SignupPage />
    </Router>
  );

  it("render component", () => {
    chai.assert.isDefined(wrapper);
  });

  it("should have four inputs", () => {
    chai.assert.equal(wrapper.find("input").length, 4);
  });

  it("should have one link", () => {
    chai.assert.equal(wrapper.find("Link").length, 1);
  });
});
