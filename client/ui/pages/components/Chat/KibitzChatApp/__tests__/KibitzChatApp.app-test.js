import React from "react";
import chai from "chai";
import { Meteor } from "meteor/meteor";
import { mount } from "enzyme";
import sinon from "sinon";
import KibitzChatApp from "../KibitzChatApp";
import ChatApp from "../../ChatApp/ChatApp";

describe("KibitzChatApp component", () => {
  beforeEach(() => {
    sinon.replace(Meteor, "call", (methodName, methodDesc, gameId, isKibitz, text, callback) => {
      if (methodName === "kibitz") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should render", () => {
    const mockProps = {
      childChatTexts: [{ _id: "HELLO", text: "Hello" }],
      chats: [{ issuer: { username: "test" }, what: "message" }],
      disabled: false,
      gameId: "fake_game_id",
      isKibitz: true,
    };
    const component = mount(<KibitzChatApp {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    })

  });

  it("should have ChatApp and simulate actions", () => {
    const mockProps = {
      childChatTexts: [{ _id: "HELLO", text: "Hello" }],
      chats: [{ issuer: { username: "test" }, what: "message" }],
      disabled: false,
      gameId: "fake_game_id",
      isKibitz: true,
    };

    const component = mount(<KibitzChatApp {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find(ChatApp).length, 1);
  
      component.find("Input").simulate("change", { target: { value: "new_value" } });
      component.find("form").simulate("submit");
    })

  });
});
