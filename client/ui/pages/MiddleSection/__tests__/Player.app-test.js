import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Player from "../Player";
import CssManager from "../../components/Css/CssManager";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("Player component", () => {
  const css = new CssManager({}, {});
  const mockProps = {
    playerData: { name: "fake_name", editable: true, locale: "us-us" },
    side: 100,
    cssManager: css,
    turnColor: "white",
    message: "fake_message",
    color: "white",
    FallenSoldiers: [],
    gameId: "fake_id",
  };

  const mockProps1 = {
    playerData: { name: "fake_name", editable: true },
    side: 100,
    cssManager: css,
    turnColor: "white",
    message: "fake_message",
    color: "white",
    FallenSoldiers: [],
    gameId: "fake_id",
  };

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

    sinon.replace(Meteor, "call", (methodName, methodDesc, gameId, color, name, callback) => {
      if (methodName === "setTag") {
        callback("fake_error");
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
    const component = mount(<Player {...mockProps} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should render without locale", () => {
    const component = mount(<Player {...mockProps1} />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  // TODO fix it
  // it("should check handleEdit function and change username", () => {
  //   const component = mount(<Player {...mockProps} />);

  //   const pActive = component.find("p").first();
  //   pActive.simulate("doubleClick");
  //   component.find("Input").simulate("change", { target: { value: "new_username1" } });
  //   component.find("Button").simulate("click");
  // });
});
