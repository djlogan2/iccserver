import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Messenger from "../Messenger";
import MessageItem from "../../MessageItem/MessageItem";
import ChatInput from "../../ChatInput/ChatInput";

describe("Messenger component", () => {
  const mockProps = {
    roomData: { _id: "fake_id", name: "fakeName" },
    messageList: [{ issuer: { username: "username" }, what: "text" }],
  };
  const component = mount(<Messenger {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have no message items", () => {
    chai.assert.equal(component.find(MessageItem).length, 0);
  });

  it("it should have ChatInput", () => {
    chai.assert.equal(component.find(ChatInput).length, 1);
  });
});
