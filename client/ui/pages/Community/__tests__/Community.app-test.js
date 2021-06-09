import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import Community from "../Community";
import { configure, mount } from "enzyme";
import { Router } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({ adapter: new Adapter() });
describe("Community component", () => {
  const component = mount(Community);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
})
