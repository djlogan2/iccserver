import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { GameControlBlock } from "../GameControlBlock";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("GameControlBlock component", () => {
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

    sinon.replace(Meteor, "call", (methodName, ...args) => {
      if (methodName === "moveToCMI") {
        args[3]("fake_error");
      }

      if (methodName === "moveBackward") {
        args[3]("fake_error");
      }

      if (methodName === "moveForward") {
        args[4]("fake_error");
      }

      if (methodName === "requestTakeback") {
        args[3]("fake_error");
      }

      if (methodName === "resignGame") {
        args[2]("fake_error");
      }

      if (methodName === "requestToDraw") {
        args[2]("fake_error");
      }

      if (methodName === "requestToAdjourn") {
        args[2]("fake_error");
      }

      if (methodName === "requestToAbort") {
        args[2]("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
    Meteor.logout.restore();

    sinon.restore();
  });

  it("should render and simulate buttons' clicks", () => {
    const mockProps = { game: { variations: { movelist: [{}, {}] } }, flip: () => null };
    const component = mount(<GameControlBlock {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const moveBackwardButtonBeginning = component.find("button#move-backward-beginning");
      chai.assert.equal(moveBackwardButtonBeginning.length, 1);
      moveBackwardButtonBeginning.simulate("click");

      const moveBackwardButton = component.find("button#move-backward");
      chai.assert.equal(moveBackwardButton.length, 1);
      moveBackwardButton.simulate("click");

      const moveForwardButton = component.find("button#move-forward");
      chai.assert.equal(moveForwardButton.length, 1);
      moveForwardButton.simulate("click");

      const moveForwardEndButton = component.find("button#move-forward-end");
      chai.assert.equal(moveForwardEndButton.length, 1);
      moveForwardEndButton.simulate("click");

      const flipButton = component.find("button#flip-button");
      chai.assert.equal(flipButton.length, 1);
      flipButton.simulate("click");

      const takeBackButton = component.find("button#take-back");
      chai.assert.equal(takeBackButton.length, 1);
      takeBackButton.simulate("click");

      const resignButton = component.find("button#resign");
      chai.assert.equal(resignButton.length, 1);
      resignButton.simulate("click");

      const drawButton = component.find("button#draw");
      chai.assert.equal(drawButton.length, 1);
      drawButton.simulate("click");

      const adjournButton = component.find("button#adjourn");
      chai.assert.equal(adjournButton.length, 1);
      adjournButton.simulate("click");

      const abortButton = component.find("button#abort");
      chai.assert.equal(abortButton.length, 1);
      abortButton.simulate("click");
    });
  });
});
