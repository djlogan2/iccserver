import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayWithFriend from "../PlayWithFriend";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import StubCollections from "meteor/hwillson:stub-collections";
import { GameRequestCollection } from "../../../../../../../imports/api/client/collections";

describe("PlayWithFriend component", () => {
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

    StubCollections.stub([GameRequestCollection, Meteor.users]);
    sinon.stub(Meteor, "subscribe").returns({ subscriptionId: 0, ready: () => true });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
  });

  it("should render", () => {
    Factory.define("game_requests", GameRequestCollection, {
      _id: "matchrequest",
      receiver_id: "fake_id_1",
    });
    const test1 = Factory.create("game_requests");

    Factory.define("users", Meteor.users, [{
      _id: "fake_id",
      username: "fake_username"
    },{
      _id: "fake_id_1",
      username: "username",
    }]);
    const test2 = Factory.create("users");
    Tracker.flush();
    const component = mount(<PlayWithFriend />);

    chai.assert.isDefined(component);
  });
});
