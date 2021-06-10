import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ChatInput from "../ChatInput";

describe("ChatInput component", () => {
  const component = mount(<ChatInput />);
  it("should render", () => {
    chai.assert.isDefined(component);
  });
});