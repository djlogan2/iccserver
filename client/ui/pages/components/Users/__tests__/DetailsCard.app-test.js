import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import DetailsCard from "../DetailsCard";

describe("DetailsCard component", () => {
  const mockProps = { currentUser: { username: "fake_username" } };
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <DetailsCard {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should simulate input change", () => {
    const input = component.find("Input");
    input.simulate("change", { tatget: { value: "new_fake_username" } });
  });

  it("should simulate button click", () => {
    const button = component.find("Button");
    button.simulate("click");
  });
});
