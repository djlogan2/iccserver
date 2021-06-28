import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayRightSidebar from "../PlayRightSidebar";
import CssManager from "../../../Css/CssManager";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("PlayRightSidebar component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_white_id",
    status: { game: "none" },
  };

  beforeEach(() => {
    sinon.stub(Meteor, "user");
    Meteor.user.returns(currentUser);

    sinon.stub(Meteor, "userId");
    Meteor.userId.returns(currentUser._id);

    sinon.stub(Meteor, "logout");
    Meteor.logout.returns();
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
    Meteor.logout.restore();
  });

  it("should render", () => {
    const mockProps = {
      game: { white: { id: "fake_white_id" }, black: { id: "fake_black_id" }, status: "playing" },
      onBotPlay: () => null,
      onSeekPLay: () => null,
      onChooseFriend: () => null,
      cssManager: new CssManager({}, {}),
      flip: () => null,
      translate: () => null,
    };

    const component = mount(<PlayRightSidebar {...mockProps} />);

    chai.assert.isDefined(component);
  });
});
