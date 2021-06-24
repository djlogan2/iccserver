import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayBlock from "../PlayBlock";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import PlayOptionButtons from "../../PlayOptionButtons/PlayOptionButtons";
import CssManager from "../../../Css/CssManager";

describe("PlayBlock component", () => {
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

  it("should render with PlayOptionButtons", () => {
    const component = mount(<PlayBlock />);

    chai.assert.isDefined(component);
    chai.assert.equal(component.find(PlayOptionButtons).length, 1);

    chai.assert.equal(component.find("Button#play-with-friend-button").length, 1);
    component.find("Button#play-with-friend-button").simulate("click");

    chai.assert.equal(component.find("Button#back-button").length, 1);
    component.find("Button#back-button").simulate("click");
  });

  it("should render with playing stuff", () => {
    const mockProps = {
      game: {
        _id: "4saWG76oCBB39RYmN",
        actions: [],
        analysis: [
          {
            id: "zN5bSTufeAS8QFQi8",
            username: "username1",
          },
        ],
        arrows: [],
        black: {
          name: "Mr black",
          rating: 1600,
          id: "fake_black_id",
        },
        circles: [],
        computer_variations: [],
        examiners: [
          {
            id: "zN5bSTufeAS8QFQi8",
            username: "username1",
          },
        ],
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        isolation_group: "public",
        observers: [
          {
            id: "zN5bSTufeAS8QFQi8",
            username: "username1",
          },
        ],
        owner: "zN5bSTufeAS8QFQi8",
        result: "*",
        startTime: { $date: "2021-06-23T13:27:50.460Z" },
        status: "playing",
        tomove: "white",
        variations: {
          cmi: 0,
          movelist: [{}],
          ecocodes: [],
        },
        white: {
          name: "Mr white",
          rating: 1600,
          id: "fake_id",
        },
        wild: 0,
      },
      cssManager: new CssManager({}, {}),
      flip: () => null,
    };

    const component = mount(<PlayBlock {...mockProps} />);

    chai.assert.isDefined(component);
  });
});
