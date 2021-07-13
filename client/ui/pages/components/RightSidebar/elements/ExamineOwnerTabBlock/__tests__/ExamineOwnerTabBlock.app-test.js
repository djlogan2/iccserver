import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ExamineOwnerTabBlock from "../ExamineOwnerTabBlock";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("ExamineOwnerTabBlock component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_owner_id",
    status: { game: "none" },
  };

  beforeEach(() => {
    sinon.stub(Meteor, "user");
    Meteor.user.returns(currentUser);

    sinon.stub(Meteor, "userId");
    Meteor.userId.returns(currentUser._id);

    sinon.replace(Meteor, "call", (methodName, methodDesc, gameId, idToAdd, callback) => {
      if (methodName === "localAddObserver" || methodName === "localAddExaminer") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();

    sinon.restore();
  });

  it("should render with examiner", () => {
    const mockProps = {
      game: {
        _id: "fake_game_id",
        owner: "fake_owner_id",
        observers: [
          { id: "fake_owner_game", username: "fake_owner" },
          { id: "fake_observer_id", username: "fake_observer" },
        ],
        examiners: [],
      },
    };
    const component = mount(<ExamineOwnerTabBlock {...mockProps} />);

    chai.assert.isDefined(component);
  });

  it("should render without examiner", () => {
    const mockProps = {
      game: {
        _id: "fake_game_id",
        owner: "fake_owner_id",
        observers: [
          { id: "fake_owner_game", username: "fake_owner" },
          { id: "fake_observer_id", username: "fake_observer" },
        ],
        examiners: [{ id: "fake_observer_id", username: "fake_observer" }],
      },
    };
    const component = mount(<ExamineOwnerTabBlock {...mockProps} />);

    chai.assert.isDefined(component);
    const button = component.find("button#handle-remove-examiner");
    const button1 = component.find("button#handle-add-examiner");
    chai.assert.equal(button.length, 1);
    chai.assert.equal(button1.length, 1);
    button.simulate("click");
    button1.simulate("click");
  });
});
