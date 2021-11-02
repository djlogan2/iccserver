import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ChatApp from "../ChatApp";
import ChatInput from "../../ChatInput/ChatInput";
import ChildChatInput from "../../ChildChatInput/ChildChatInput";

describe("ChatApp component", () => {
  const mockProps = {
    chats: [{ issuer: { username: "test" }, what: "message" }],
    childChat: false,
    onMessage: () => null,
  };

  const component = mount(<ChatApp {...mockProps} />);
  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should have Chat input and no Child Chat Input", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find(ChatInput).length, 1);
      chai.assert.equal(component.find(ChildChatInput).length, 0);

      component.find("Input").simulate("change", { target: { value: "new_value" } });
      component.find("form").simulate("submit");
    });
  });

  it("should have Child Chat Input and no Chat input", () => {
    const mockProps1 = {
      chats: [{ issuer: { username: "test" }, what: "message" }],
      childChatTexts: [{ _id: "HELLO", text: "Hello" }],
      childChat: true,
    };

    const component1 = mount(<ChatApp {...mockProps1} />);
    Promise.resolve(component1).then(() => {
      chai.assert.equal(component1.find(ChatInput).length, 0);
      chai.assert.equal(component1.find(ChildChatInput).length, 1);
    });
  });
});
