import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import SignupPage from "../SignupPage";
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import sinon from "sinon";
import { Accounts } from "meteor/accounts-base";

describe("SignupPage", () => {
  const newUsername = "username1";
  const newEmail = "email1@email.com";
  const newPassword = "password1";

  beforeEach(() => {
    sinon.replace(Accounts, "createUser", (args, callback) => {
        callback("fake_error");
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const history = createBrowserHistory();
  const wrapper = mount(
    <Router history={history}>
      <SignupPage />
    </Router>
  );

  const page = wrapper.find(SignupPage);

  it("render component", () => {
    chai.assert.isDefined(wrapper);
  });

  it("should have four inputs", () => {
    chai.assert.equal(wrapper.find("input").length, 4);
  });

  it("should have one link", () => {
    chai.assert.equal(wrapper.find("Link").length, 1);
  });

  it("should submit form", () => {
    const usernameInput = page.find("#signup-name");

    usernameInput.simulate("focus");
    usernameInput.simulate("change", {
      target: { value: newUsername, id: "username", name: "username" },
    });
    usernameInput.simulate("keyDown", {
      which: 27,
      target: {
        blur() {
          usernameInput.simulate("blur");
        },
      },
    });

    const emailInput = page.find("#signup-email");

    emailInput.simulate("focus");
    emailInput.simulate("change", {
      target: { value: newEmail, name: "email" },
    });
    emailInput.simulate("keyDown", {
      which: 27,
      target: {
        blur() {
          passwordInput.simulate("blur");
        },
      },
    });

    const passwordInput = page.find("#signup-password");

    passwordInput.simulate("focus");
    passwordInput.simulate("change", {
      target: { value: newPassword, name: "password" },
    });
    passwordInput.simulate("keyDown", {
      which: 27,
      target: {
        blur() {
          passwordInput.simulate("blur");
        },
      },
    });

    const form = wrapper.find("form").first();
    form.simulate("submit");
  });
});
