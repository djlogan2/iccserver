import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import SignupPage from "../SignupPage";
import { configure, mount } from "enzyme";
import { Router } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({ adapter: new Adapter() });
describe("SignupPage", () => {
  const history = createBrowserHistory();

  it("render component", () => {
    const wrapper = mount(
      <Router history={history}>
        <SignupPage />
      </Router>
    );
    chai.assert.isDefined(wrapper);
    chai.assert.equal(wrapper.find("input").length, 4);
    chai.assert.equal(wrapper.find("Link").length, 1);
  });
});
