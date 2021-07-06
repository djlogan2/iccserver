import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import EditorRightSidebar from "../EditorRightSidebar";

describe("EditorRightSidebar component", () => {
  const history = createBrowserHistory();
  const mockProps = { whiteCastling: [], blackCastling: [], onCastling: () => null };

  const component = mount(
    <Router history={history}>
      <EditorRightSidebar {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have 4 buttons", () => {
    chai.assert.equal(component.find("Button").length, 4);
  });

  it("should have 1 input", () => {
    chai.assert.equal(component.find("Input").length, 1);
  });

  it("should have 2 radios", () => {
    chai.assert.equal(component.find("Radio").length, 2);
  });
});
