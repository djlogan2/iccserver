import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import GameRequestModal from "../GameRequestModal";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("GameRequestModal component", () => {
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
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
  });

  it("should render with seek", () => {
    const history = createBrowserHistory();

    const mockProps = { gameRequest: { type: "seek", owner: "fake_id" } };
    const component = mount(
      <Router history={history}>
        <GameRequestModal {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should render with match", () => {
    const history = createBrowserHistory();

    const mockProps = { gameRequest: { type: "match", owner: "fake_id" } };
    const component = mount(
      <Router history={history}>
        <GameRequestModal {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should render with exception", () => {
    const history = createBrowserHistory();

    const mockProps = { gameRequest: { type: "exception", owner: "fake_id" } };
    const component = mount(
      <Router history={history}>
        <GameRequestModal {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
