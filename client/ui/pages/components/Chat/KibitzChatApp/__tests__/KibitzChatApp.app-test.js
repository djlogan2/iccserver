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

  it("should have ChatApp", () => {
    chai.assert.equal(component.find(ChatApp).length, 1);
  });
});
