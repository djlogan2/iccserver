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
    const component = mount(<KibitzChatApp />);

    chai.assert.isDefined(component);
  });

  it("should have ChatApp and simulate actions", () => {
    const component = mount(<KibitzChatApp />);

    chai.assert.equal(component.find(ChatApp).length, 1);

    component.find("Input").simulate("change", { target: { value: "new_value" } });
    component.find("form").simulate("submit");
  });
});
