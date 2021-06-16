import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ChildChatInput from "../ChildChatInput";

describe("ChildChatInput component", () => {
  const mockProps = {
    childChatTexts: [{ _id: "HELLO", text: "Hello" }],
    onMessage: () => null,
    onChange: () => null,
  };
  const component = mount(<ChildChatInput {...mockProps} />);
  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have form", () => {
    chai.assert.equal(component.find("form").length, 1);
  });

  it("should have one select", () => {
    chai.assert.equal(component.find("Select").length, 1);
  });

  it("should submit form", () => {
    const form = component.find("form").first();
    form.simulate("submit");
  });
});
