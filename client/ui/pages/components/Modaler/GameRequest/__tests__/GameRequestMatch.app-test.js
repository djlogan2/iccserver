import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import GameRequestMatch from "../GameRequestMatch";

describe("GameRequestMatch component", () => {
  const history = createBrowserHistory();
  const mockProps = { gameRequest: { _id: "fake_id", challenger: "challenger" } };

  const component = mount(
    <Router history={history}>
      <GameRequestMatch {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should simulate onOk action", () => {
    chai.assert.equal(component.find("Modal").length, 1);
  });
});
