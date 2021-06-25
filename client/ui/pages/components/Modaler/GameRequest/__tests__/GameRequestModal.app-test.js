import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import GameRequestModal from "../GameRequestModal";

describe("GameRequestModal component", () => {
  const history = createBrowserHistory();

  const mockProps = { gameRequest: { type: "seek", owner: "fake_id" } };
  const component = mount(
    <Router history={history}>
      <GameRequestModal {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
