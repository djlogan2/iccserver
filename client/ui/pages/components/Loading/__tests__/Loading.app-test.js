import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import Loading from "../Loading";

describe("Loading component", () => {
  const history = createBrowserHistory();

  const component = mount(
    <Router history={history}>
      <Loading />
    </Router>
  );

  const pureComponent = mount(
    <Router history={history}>
      <Loading isPure />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
    chai.assert.isDefined(pureComponent);
  });

  it("should have app wrapper", () => {
    chai.assert.equal(component.find("AppWrapper").length, 1);
    chai.assert.equal(pureComponent.find("AppWrapper").length, 1);
  });

  it("should have two Col", () => {
    chai.assert.equal(component.find("Col").length, 2);
  });

  it("should have one Col", () => {
    chai.assert.equal(pureComponent.find("Col").length, 1);
  });

  it("should have two Spin", () => {
    chai.assert.equal(component.find("Spin").length, 2);
  });

  it("should have one Spin", () => {
    chai.assert.equal(pureComponent.find("Spin").length, 1);
  });

  it("should have one Space", () => {
    chai.assert.equal(component.find("Space").length, 1);
  });

  it("should have one Space", () => {
    chai.assert.equal(pureComponent.find("Space").length, 1);
  });
});
