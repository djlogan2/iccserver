import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import SignupPage, { SignupPage_Pure } from "../SignupPage";
import { mount, shallow } from "enzyme";
import { Router } from "react-router-dom";
import sinon from "sinon";
import { Accounts } from "meteor/accounts-base";
import { RESOURCE_LOGIN, RESOURCE_SIGN_UP } from "../../../../../constants/resourceConstants";

describe("SignupPage", () => {
  let wrapper;
  let page;
  const history = createBrowserHistory();
  const newUsername = "username1";
  const newEmail = "email1@email.com";
  const newPassword = "password1";

  beforeEach(() => {
    sinon.replace(Accounts, "createUser", (args, callback) => {
      callback("fake_error");
    });
    wrapper = mount(
      <Router history={history}>
        <SignupPage />
      </Router>
    );
    page = wrapper.find(SignupPage);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("render component", () => {
    Promise.resolve(wrapper).then(() => {
      chai.assert.isDefined(wrapper);
    });
  });

  it("should have four inputs", () => {
    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find("input").length, 4);
    });
  });

  it("should have text and password fields", () => {
    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(page.find("#signup-name").length, 1);
      chai.assert.equal(page.find("#signup-email").length, 1);
      chai.assert.equal(page.find("#signup-password").length, 1);
      chai.assert.equal(page.find("#signup-name").prop("type"), "text");
      chai.assert.equal(page.find("#signup-email").prop("type"), "email");
      chai.assert.equal(page.find("#signup-password").prop("type"), "password");
    });
  });

  it("should have redirect link", () => {
    Promise.resolve(wrapper).then(() => {
      const link = wrapper.find("Link");
      chai.assert.equal(link.length, 1, "no link");
      chai.assert.equal(link.prop("to"), RESOURCE_LOGIN, "wrong url");
    });
  });

  it("should submit form", () => {
    Promise.resolve(wrapper).then(() => {
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

  // it("createUser function is called", () => {
  //   const create = sinon.spy(Accounts, "createUser");
  //   const form = page.find("form").first();
  //   form.simulate("submit");
  //   chai.assert.isTrue(create.calledOnce);
  // })
});

describe("SignUp Page Pure Component", () => {
  let page;
  beforeEach(() => {
    page = shallow(<SignupPage_Pure classes={{}} translate={() => {}} />);
  });

  afterEach(() => {});

  it("expects error is shown", (done) => {
    Promise.resolve(page).then(() => {
      const errMsg = "error message";
      const mockState = {
        error: errMsg,
        email: "",
        name: "",
        password: "",
      };
      page.setState(mockState, () => {
        chai.assert.equal(page.find(".alert-danger").length, 1, "no error shown");
        chai.assert.equal(page.find(".alert-danger").text(), errMsg, "wrong error message");
        done();
      });
    });
  });

  it("expects input fields changes value", () => {
    Promise.resolve(page).then(() => {
      const username = "username1";
      const email = "email1@email.com";
      const password = "password1";

      const newUserName = page.find("#signup-name");
      const newUserEmail = page.find("#signup-email");
      const newUserPassword = page.find("#signup-password");
      newUserName.simulate("change", {
        target: { value: username },
      });
      newUserEmail.simulate("change", {
        target: { value: email },
      });
      newUserPassword.simulate("change", {
        target: { value: password },
      });

      chai.assert.equal(page.state().email, email, "set email wrong");
      chai.assert.equal(page.state().password, password, "set password wrong");
      chai.assert.equal(page.state().username, username, "set name wrong");
    });
  });
});
