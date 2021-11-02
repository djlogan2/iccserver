import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import PlayModaler from "../PlayModaler";

describe("PlayModaler component", () => {
  const history = createBrowserHistory();

  it("should render with white won result", () => {
    const mockProps = {
      clientMessage: {},
      gameResult: "1-0",
      whitePlayerUsername: "white_fake_username",
      blackPlayerUsername: "black_fake_username",
      visible: true,
      onRematch: () => null,
    };

    const component = mount(
      <Router history={history}>
        <PlayModaler {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const rematchButton = component.find("Button#rematch-button");

      chai.assert.equal(rematchButton.length, 1);
      rematchButton.simulate("click");
    });
  });

  it("should render with white black result", () => {
    const mockProps = {
      clientMessage: {},
      gameResult: "0-1",
      whitePlayerUsername: "white_fake_username",
      blackPlayerUsername: "black_fake_username",
      visible: true,
      onRematch: () => null,
    };

    const component = mount(
      <Router history={history}>
        <PlayModaler {...mockProps} />
      </Router>
    );
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const rematchButton = component.find("Button#rematch-button");

      chai.assert.equal(rematchButton.length, 1);
      rematchButton.simulate("click");
    });
  });

  it("should render with drawn result", () => {
    const mockProps = {
      clientMessage: {},
      gameResult: "1/2-1/2",
      whitePlayerUsername: "white_fake_username",
      blackPlayerUsername: "black_fake_username",
      visible: true,
      onRematch: () => null,
    };

    const component = mount(
      <Router history={history}>
        <PlayModaler {...mockProps} />
      </Router>
    );
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);

      const rematchButton = component.find("Button#rematch-button");

      chai.assert.equal(rematchButton.length, 1);
      rematchButton.simulate("click");
    });
  });
});
