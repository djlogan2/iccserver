import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ExamineObserverTabBlock from "../ExamineObserverTabBlock";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("ExamineObserverTabBlock component", () => {
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
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
  });

  it("should render for owner", () => {
    const mockProps = {
      game: {
        observers: [
          { id: "fake_owner_id", username: "fake_owner" },
          { id: "fake_observer_id", username: "fake_observer" },
        ],
        owner: "fake_owner_id",
      },
      unObserveUser: () => null,
    };

    const component = mount(<ExamineObserverTabBlock {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const button = component.find("Button");
      button.simulate("click");
    });
  });

  it("should render for observer", () => {
    const mockProps = {
      game: {
        observers: [{ id: "fake_observer_id", username: "fake_observer" }],
        owner: "fake_owner2_id",
      },
      unObserveUser: () => null,
    };

    const component = mount(<ExamineObserverTabBlock {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const button = component.find("Button");
      button.simulate("click");
    });
  });
});
