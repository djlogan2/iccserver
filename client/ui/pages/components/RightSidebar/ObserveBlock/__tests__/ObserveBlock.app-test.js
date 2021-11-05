import React from "react";
import { mount } from "enzyme";
import chai from "chai";
import ObserveBlock from "../ObserveBlock";

describe("ObserveBlock component", () => {
  const component = mount(<ObserveBlock />);

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
