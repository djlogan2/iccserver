import React from "react";
import chai from "chai";
import { configure, mount } from "enzyme";
import BoardWrapper from "../BoardWrapper";

describe("BoardWrapper component", () => {
  const component = mount(<BoardWrapper />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have one div", () => {
    chai.assert.equal(component.find("div").length, 1);
  });
});