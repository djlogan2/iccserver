import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Analytics from "../Analytics";

describe("Analytics component", () => {
  const mockProps = { orientation: "white" };
  const component = mount(<Analytics {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have one progress bar", () => {
    chai.assert.equal(component.find("Progress").length, 1);
  })
});
