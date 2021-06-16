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
  };

  const component = mount(<ChatApp {...mockProps} />);
  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have Chat input and no Child Chat Input", () => {
    chai.assert.equal(component.find(ChatInput).length, 1);
    chai.assert.equal(component.find(ChildChatInput).length, 0);
  });

  it("should have Child Chat Input and no Chat input", () => {
    const mockProps1 = {
      chats: [{ issuer: { username: "test" }, what: "message" }],
      childChatTexts: [{ _id: "HELLO", text: "Hello" }],
      childChat: true,
    };

    const component1 = mount(<ChatApp {...mockProps1} />);
    chai.assert.equal(component1.find(ChatInput).length, 0);
    chai.assert.equal(component1.find(ChildChatInput).length, 1);
  });
  //
  // it("should call handleChange function", () => {
  //   component.instance().handleChange("fake_text");
  // });
  //
  // it("should call handleMessage function", () => {
  //   component.instance().handleMessage();
  // })
});
