import React from "react";
import chai from "chai";
import { configure, mount } from "enzyme";
import BoardWrapper from "../BoardWrapper";

describe("BoardWrapper component", () => {
  const component = mount(<BoardWrapper />);

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should have one div", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("div").length, 1);
    });
  });
});
