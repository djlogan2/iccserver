import React from "react";
import { mount } from "enzyme";
import chai from "chai";
import ObserveBlock from "../ObserveBlock";

describe("ObserveBlock component", () => {
  const component = mount(<ObserveBlock />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
