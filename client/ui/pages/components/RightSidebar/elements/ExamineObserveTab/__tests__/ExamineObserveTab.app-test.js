import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import sinon from "sinon";

import ExamineObserveTab from "../ExamineObserveTab";
import { Meteor } from "meteor/meteor";

describe("ExamineObserveTab component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_id",
    status: { game: "examining" },
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

  it("should render", () => {
    const mockProps = {
      game: {
        _id: "fake_game_id",
        observers: [{ _id: "fake_observer_id", name: "fake_observer_name" }],
      },
    };
    const component = mount(<ExamineObserveTab {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });

    // const input = component.find("#find-users-input");
    // chai.assert.equal(input.length, 1);
    // input.simulate("search", { target: { value: "new_search_value" } });
  });
});
