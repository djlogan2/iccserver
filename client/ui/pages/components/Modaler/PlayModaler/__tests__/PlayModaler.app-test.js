import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayModaler from "../PlayModaler";

describe("PlayModaler component", () => {
  const component = mount(<PlayModaler />);
  it("should render", () => {
    chai.assert.isDefined(component);
  })
});
