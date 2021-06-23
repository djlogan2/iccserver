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
    onMessage: () => null,
    onChange: () => null,
    inputValue: "fake_value",
  };

  it("should render", () => {
    const component = mount(<Messenger {...mockProps} />);
    chai.assert.isDefined(component);
  });

  it("should have no message items", () => {
    const component = mount(<Messenger {...mockProps} />);
    chai.assert.equal(component.find(MessageItem).length, 0);
  });

  it("it should have ChatInput", () => {
    const component = mount(<Messenger {...mockProps} />);
    chai.assert.equal(component.find(ChatInput).length, 1);
  });

  it("should handle message function", () => {
    const component = mount(<Messenger {...mockProps} />);

    component.find("Input").simulate("change", { target: { value: "new_text" } });
    component.find("form").simulate("submit");
  });
});
