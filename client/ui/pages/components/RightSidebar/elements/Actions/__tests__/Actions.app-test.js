import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { mount } from "enzyme";
import Actions from "../Actions";

describe("Actions component", () => {
  const history = createBrowserHistory();
  const mockProps = { playComputer: () => null };
  const component = mount(
    <Router history={history}>
      <Actions {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should click the buttons", () => {
    component.find("Button#editor-button").simulate("click");
    component.find("Button#play-computer-button").simulate("click");
  });
});
