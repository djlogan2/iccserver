import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PersonalChatApp from "../PersonalChatApp";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("PersonalChatApp component", () => {
  beforeEach(() => {
    sinon.replace(Meteor, "call", (methodName, methodDesc, opponentId, text, callback) => {
      if (methodName === "writeToUser") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should render", () => {
    const component = mount(<PersonalChatApp />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      component.find("Input").simulate("change", { target: { value: "new_value" } });
      component.find("form").simulate("submit");
    });
  });
});
