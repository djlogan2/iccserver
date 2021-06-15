import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PrimaryButton from "../PrimaryButton";

describe("PrimaryButton component", () => {
  const component = mount(<PrimaryButton />);

  it("should render", () => {
    chai.assert.isDefined(component);
  })
});