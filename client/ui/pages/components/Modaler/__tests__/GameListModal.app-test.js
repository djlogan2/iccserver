import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import GameListModal from "../GameListModal";

describe("GameListModal component", () => {
  const history = createBrowserHistory();

  it("should render as black won", () => {
    const mockProps = {
      isImported: false,
      gameList: [
        {
          _id: "fake_id",
          white: { name: "white" },
          black: { name: "black" },
          is_imported: false,
          result: "0-1",
        },
      ],
      onClose: () => null,
      visible: true,
    };

    const component = mount(
      <Router history={history}>
        <GameListModal {...mockProps} />
      </Router>
    );

    chai.assert.isDefined(component);
  });

  it("should render as white won", () => {
    const mockProps = {
      isImported: false,
      gameList: [
        {
          _id: "fake_id",
          white: { name: "white" },
          black: { name: "black" },
          is_imported: false,
          result: "1-0",
        },
      ],
      onClose: () => null,
      visible: true,
    };

    const component = mount(
      <Router history={history}>
        <GameListModal {...mockProps} />
      </Router>
    );

    chai.assert.isDefined(component);
  });

  it("should render as drawn result", () => {
    const mockProps = {
      isImported: false,
      gameList: [
        {
          _id: "fake_id",
          white: { name: "white" },
          black: { name: "black" },
          is_imported: false,
          result: "1/2-1/2",
        },
      ],
      onClose: () => null,
      visible: true,
    };

    const component = mount(
      <Router history={history}>
        <GameListModal {...mockProps} />
      </Router>
    );

    chai.assert.isDefined(component);
  });

  it("should render as unknown result", () => {
    const mockProps = {
      isImported: false,
      gameList: [
        {
          _id: "fake_id",
          white: { name: "white" },
          black: { name: "black" },
          is_imported: false,
          result: "*",
        },
      ],
      onClose: () => null,
      visible: true,
    };

    const component = mount(
      <Router history={history}>
        <GameListModal {...mockProps} />
      </Router>
    );

    chai.assert.isDefined(component);
  });
});
