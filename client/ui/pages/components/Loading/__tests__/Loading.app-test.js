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
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
    Promise.resolve(pureComponent).then(() => {
      chai.assert.isDefined(pureComponent);
    });
  });

  it("should have app wrapper", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("AppWrapper").length, 1);
    });
    Promise.resolve(pureComponent).then(() => {
      chai.assert.equal(pureComponent.find("AppWrapper").length, 1);
    });
  });

  it("should have two Col", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("Col").length, 2);
    });
  });

  it("should have one Col", () => {
    Promise.resolve(pureComponent).then(() => {
      chai.assert.equal(pureComponent.find("Col").length, 1);
    });
  });

  it("should have two Spin", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("Spin").length, 2);
    });
  });

  it("should have one Spin", () => {
    Promise.resolve(pureComponent).then(() => {
      chai.assert.equal(pureComponent.find("Spin").length, 1);
    });
  });

  it("should have one Space", () => {
    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("Space").length, 1);
    });
  });

  it("should have one Space", () => {
    Promise.resolve(pureComponent).then(() => {
      chai.assert.equal(pureComponent.find("Space").length, 1);
    });
  });
});
