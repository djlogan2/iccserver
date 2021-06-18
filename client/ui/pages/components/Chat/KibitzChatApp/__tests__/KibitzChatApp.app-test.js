import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import KibitzChatApp from "../KibitzChatApp";
import ChatApp from "../../ChatApp/ChatApp";

describe("KibitzChatApp component", () => {
  const component = mount(<KibitzChatApp />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have ChatApp and simulate actions", () => {
    chai.assert.equal(component.find(ChatApp).length, 1);

    component.find("Input").simulate("change", { target: { value: "new_value" } });
    component.find("form").simulate("submit");
  });
});
