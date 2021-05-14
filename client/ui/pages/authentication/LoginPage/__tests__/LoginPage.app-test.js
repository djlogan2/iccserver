import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import LoginPage from "../LoginPage";
import { configure, mount } from "enzyme";
import { Router } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({ adapter: new Adapter() });
describe("Login Page", () => {
  const history = createBrowserHistory();
  const newUsername = "username";
  const newPassword = "password";

  const wrapper = mount(
    <Router history={history}>
      <LoginPage/>
    </Router>
  );

  it("render component", () => {
    chai.assert.isDefined(wrapper);
  });

  it("should have three inputs", () => {
    chai.assert.equal(wrapper.find("input").length, 3);
  });

  it("should have redirect link", () => {
    chai.assert.equal(wrapper.find("Link").length, 1);
  });

  it.only("expects input username changes value the text after click", () => {
    const page = wrapper.find(LoginPage);
    console.log(page, 'page1');
    chai.assert.equal(page.find("#login-email").length, 1)
    chai.assert.equal(page.find("#login-password").length, 1)

    page.find("#login-email").simulate("change", {
      target: { value: newUsername },
    });
    page.find("#login-password").simulate("change", {
      target: { value: newPassword },
    });

    // wrapper.find("#login-button").simulate("click");

    chai.assert.equal(page.state('email'), newUsername)
    chai.assert.equal(page.state('password'), newPassword)
    // chai.assert.equal(wrapper.find("#login-email").length, 1);
    // chai.assert.equal(wrapper.find(`input[value='${newUsername}']`).prop('id'), "login-email");
  });
});
