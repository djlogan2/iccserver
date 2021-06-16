import React from "react";
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import chai from "chai";
import { mount } from "enzyme";
import App from "./App";

describe("App component", () => {
  const history = createBrowserHistory();

  it("renders correctly", () => {
    const wrapper = mount(
        <Router history={history}>
          <App />
        </Router>
    );
    chai.assert.isDefined(wrapper);
    chai.assert.equal(wrapper.prop('isReady'), true);
  });
});
