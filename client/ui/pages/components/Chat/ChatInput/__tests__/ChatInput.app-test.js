import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ChatInput from "../ChatInput";

describe("ChatInput component", () => {
  const mockProps = {
    value: "test1",
    onChange: () => null,
    onMessage: () => null,
    disabled: false,
  };

  const component = mount(<ChatInput {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have a form", () => {
    chai.assert.equal(component.find("form").length, 1);
  });

  it("should simulate input change", () => {
    const input = component.find("Input").first();
    input.simulate("change", { target: { value: "test" } });
  });

  it("should submit form", () => {
    const form = component.find("form").first();
    form.simulate("submit");
  });
});
