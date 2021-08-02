import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import Community from "../Community";
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import StubCollections from "meteor/hwillson:stub-collections";
import { Chat, Rooms } from "../../../../../imports/api/client/collections";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("Community component", () => {
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

    StubCollections.stub([Chat, Rooms]);
    sinon.stub(Meteor, "subscribe").returns({ subscriptionId: 0, ready: () => true });

    sinon.replace(Meteor, "call", (methodName, ...rest) => {
      if (methodName === "leaveRoom") {
        rest[2]("fake_error");
      }

      if (methodName === "joinRoom") {
        rest[2]("fake_error");
      }

      if (methodName === "createRoom") {
        rest[3]("fake_error");
      }

      if (methodName === "writeToRoom") {
        rest[3]("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();

    StubCollections.restore();
    Meteor.subscribe.restore();

    sinon.restore();
  });

  it("should render", () => {
    Factory.define("chat", Chat, {});
    const test1 = Factory.create("chat");
    Factory.define("rooms", Rooms, {
      _id: "fake_room",
      name: "fake_room_name",
    });
    const test2 = Factory.create("rooms");
    Tracker.flush();

    const component = mount(
      <Router history={history}>
        <Community />
      </Router>
    );

    chai.assert.isDefined(component);

    const liRoom = component.find("li#fake_room");
    chai.assert.equal(liRoom.length, 1);

    liRoom.simulate("keyDown", { key: "Enter" });

    const inputMessage = component.find("input#chat-input");
    chai.assert.equal(inputMessage.length, 1);

    inputMessage.simulate("change", { target: { value: "fake_value" } });

    const button = component.find("Button#send-message");
    chai.assert.equal(button.length, 1);

    button.simulate("click");

    const sendForm = component.find("form#chat-form");
    chai.assert.equal(sendForm.length, 1);

    sendForm.simulate("submit");

    const buttonRightBlock = component.find("Button#open-right-block");
    chai.assert.equal(buttonRightBlock.length, 1);

    buttonRightBlock.simulate("click");

    const buttonCreateRoom = component.find("Button#create-room");
    chai.assert.equal(buttonCreateRoom.length, 1);

    buttonCreateRoom.simulate("click");

    const inputRoomName = component.find("Input#room-name");
    chai.assert.equal(inputRoomName.length, 1);

    inputRoomName.simulate("change", { target: { value: "new_fake_room" } });

    const modalWindow = component.find("Modal#room-create-modal");
    chai.assert.equal(modalWindow.length, 1);

    modalWindow.simulate("submit");

    const buttonCloseRightBlock = component.find("Button#close-right-block");
    chai.assert.equal(buttonCloseRightBlock.length, 1);

    buttonCloseRightBlock.simulate("click");
  });
});
