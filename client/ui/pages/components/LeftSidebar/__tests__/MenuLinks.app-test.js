import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import MenuLinks from "../MenuLinks";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("MenuLinks component", () => {
  const mockProps = { visible: true };
  const history = createBrowserHistory();

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

    sinon.replace(Meteor, "call", (methodName, callback) => {
      if (methodName === "current_release") {
        callback("fake_error", "fake_release");
      }

      if (methodName === "current_commit") {
        callback("fake_error", "fake_commit");
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
    const wrapper = mount(
      <Router history={history}>
        <MenuLinks {...mockProps} />
      </Router>
    );

    chai.assert.isDefined(wrapper);
  });
});
