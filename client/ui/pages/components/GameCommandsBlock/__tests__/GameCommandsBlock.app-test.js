import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import GameCommandsBlock from "../GameCommandsBlock";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("GameCommandsBlock component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_id",
    status: { game: "none" },
  };

  beforeEach(() => {
    sinon.stub(Meteor, "user");
    Meteor.user.returns(currentUser);

    sinon.stub(Meteor, "userId");
    Meteor.userId.returns(currentUser._id);

    sinon.stub(Meteor, "logout");
    Meteor.logout.returns();

    sinon.replace(Meteor, "call", (methodName, methodDesc, gameId, value, callback) => {
      if (methodName === "addGameMove") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
    Meteor.logout.restore();

    sinon.restore();
  });

  it("should render", () => {
    const component = mount(<GameCommandsBlock />);

    chai.assert.isDefined(component);
  });

  it("should simulate input change and button click", () => {
    const mockProps = { game: { _id: "fake_game_id" } };
    const component = mount(<GameCommandsBlock {...mockProps} />);

    const input = component.find("Input");
    input.simulate("change", { target: { value: "new_test_value" } });

    const button = component.find("Button");
    button.simulate("click");
  });
});
