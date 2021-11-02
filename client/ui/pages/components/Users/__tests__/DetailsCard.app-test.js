import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import DetailsCard from "../DetailsCard";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("DetailsCard component", () => {
  const mockProps = { currentUser: { username: "fake_username" } };

  beforeEach(() => {
    sinon.replace(Meteor, "call", (methodName, methodDesc, userId, username, callback) => {
      if (methodName === "setOtherUsername") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should render", () => {
    const history = createBrowserHistory();

    const component = mount(
      <Router history={history}>
        <DetailsCard {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should simulate input change", () => {
    const history = createBrowserHistory();

    const component = mount(
      <Router history={history}>
        <DetailsCard {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      const input = component.find("Input");
      input.simulate("change", { tatget: { value: "new_fake_username" } });
    });
  });

  it("should simulate button click", () => {
    const history = createBrowserHistory();

    const component = mount(
      <Router history={history}>
        <DetailsCard {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      const input = component.find("Input");
      input.simulate("change", { tatget: { value: "new_fake_username" } });

      const button = component.find("Button");
      button.simulate("click");
    });
  });
});
