import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import MiddleBoard from "../MiddleBoard";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import CssManager from "../../components/Css/CssManager";

describe("MiddleBoard component", () => {
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

  it("should render with null", () => {
    const mockProps = {
      game: {},
      playersInfo: { black: { id: "fake_id" }, white: { id: "fake_id_2" } },
    };
    const component = mount(<MiddleBoard {...mockProps} />);

    chai.assert.isDefined(component);
  });

  it("should render with game by black player", () => {
    const mockProps = {
      game: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", status: "playing" },
      playersInfo: { black: { id: "fake_id" }, white: { id: "fake_id_2" } },
      cssManager: new CssManager({}, {}),
      onDrawObject: () => null,
      onDrop: () => null,
      capture: { w: {}, b: {} },
      startTime: "2021-08-12T10:43:55.551Z",
      clocks: { black: {}, white: {} },
    };
    const component = mount(<MiddleBoard {...mockProps} />);

    chai.assert.isDefined(component);
  });

  it("should render with game by white player", () => {
    const mockProps = {
      game: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", status: "playing" },
      playersInfo: { black: { id: "fake_id_1" }, white: { id: "fake_id" } },
      cssManager: new CssManager({}, {}),
      onDrawObject: () => null,
      onDrop: () => null,
      capture: { w: {}, b: {} },
      startTime: "2021-08-12T10:43:55.551Z",
      clocks: { black: {}, white: {} },
    };
    const component = mount(<MiddleBoard {...mockProps} />);

    chai.assert.isDefined(component);
  });
});
