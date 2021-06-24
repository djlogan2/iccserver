import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { mount } from "enzyme";
import Examine from "../Examine";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("Examine component", () => {
  beforeEach(() => {
    sinon.replace(Meteor, "call", (methodName, methodDesc, name1, name2, wildNumber, callback) => {
      if (methodName === "startLocalExaminedGame") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const history = createBrowserHistory();

  it("should render", () => {
    const component = mount(
      <Router history={history}>
        <Examine />
      </Router>
    );

    chai.assert.isDefined(component);
  });
});
