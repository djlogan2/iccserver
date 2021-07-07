import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import LoginPage from "../LoginPage";
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("Login Page", () => {
  const history = createBrowserHistory();
  const newUsername = "username1";
  const newPassword = "password1";

  beforeEach(() => {
    sinon.replace(Meteor, "loginWithPassword", (email, password, callback) => {
        callback("fake_error");
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const wrapper = mount(
    <Router history={history}>
      <LoginPage />
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

  it("expects input username changes value the text after click", () => {
    const page = wrapper.find(LoginPage);
    chai.assert.equal(page.find("#login-email").length, 1);
    chai.assert.equal(page.find("#login-password").length, 1);

    const mockState = {
      error: "",
      email: "",
      password: "",
    };

    page.setState(mockState);

    const usernameInput = page.find("#login-email");

    usernameInput.simulate("focus");
    usernameInput.simulate("change", {
      target: { value: newUsername, id: "username", name: "username" },
    });
    usernameInput.simulate('keyDown', {
      which: 27,
      target: {
        blur() {
          usernameInput.simulate('blur');
        },
      },
    });

    const passwordInput = page.find("#login-password");

    passwordInput.simulate("focus");
    passwordInput.simulate("change", {
      target: { value: newPassword, name: "password" },
    });
    passwordInput.simulate('keyDown', {
      which: 27,
      target: {
        blur() {
          // Needed since <EditableText /> calls target.blur()
          passwordInput.simulate('blur');
        },
      },
    });

    const form = page.find("form").first();
    form.simulate("submit");

    // console.log(page.instance().state, "input : ", usernameInput.props().value);
    // chai.assert.equal(page.state("email"), newUsername);
    // chai.assert.equal(page.state('password'), newPassword)
    // chai.assert.equal(wrapper.find("#login-email").length, 1);
    // chai.assert.equal(wrapper.find(`input[value='${newUsername}']`).prop('id'), "login-email");
  });
});
