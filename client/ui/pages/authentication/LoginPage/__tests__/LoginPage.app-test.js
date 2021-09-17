import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import LoginPage, {LoginPage_Pure} from "../LoginPage";
import { mount, shallow } from "enzyme";
import { Router } from "react-router-dom";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { RESOURCE_HOME, RESOURCE_SIGN_UP } from "../../../../../constants/resourceConstants";

describe("Login Page", () => {
  let wrapper;
  const history = createBrowserHistory();
  const newUsername = "username1";
  const newPassword = "password1";

  beforeEach(() => {
    wrapper = mount(
      <Router history={history}>
        <LoginPage />
      </Router>
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it("render component", () => {
    chai.assert.isDefined(wrapper);
  });

  it("should have three inputs", () => {
    chai.assert.equal(wrapper.find("input").length, 3);
  });

  it("should have text and password fields", () => {
    const page = wrapper.find(LoginPage);
    chai.assert.equal(page.find("#login-email").length, 1);
    chai.assert.equal(page.find("#login-password").length, 1);
    chai.assert.equal(page.find("#login-email").prop("type"), "email");
    chai.assert.equal(page.find("#login-password").prop("type"), "password");
  });

  it("should have redirect link", () => {
    const link = wrapper.find("Link");
    chai.assert.equal(link.length, 1, "no link");
    chai.assert.equal(link.prop("to"), RESOURCE_SIGN_UP, "wrong url");
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

  // it("loginWithPassword function is called", () => {
  //   const page = wrapper.find(LoginPage);
  //   const login = sinon.spy(Meteor, "loginWithPassword");
  //   const form = page.find("form").first();
  //   form.simulate("submit");
  //   chai.assert.isTrue(login.calledOnce);
  // })

  // it("loginWithPassword function is called without error", () => {
  //   const page = wrapper.find(LoginPage);
  //   sinon.replace(Meteor, "loginWithPassword", (email, password, callback) => {
  //     callback("");
  //   });
  //   const redirect = sinon.spy(history, "push");
  //   const form = page.find("form").first();
  //   form.simulate("submit");
  //   chai.assert.isTrue(redirect.calledOnce);
  //  chai.expect(redirect).to.have.been.calledWith(RESOURCE_HOME);
  //
  // })

});

describe("Login Page Pure Component", () => {
  let page;
  beforeEach(() => {
    page = shallow(
      <LoginPage_Pure classes={{}} translate={()=>{}}/>
    );
  });

  afterEach(() => { });

  it("expects error is shown", (done) => {
    const errMsg = "error message";
    const mockState = {
      error: errMsg,
      email: "",
      password: "",
    };
    page.setState(mockState, () => {
      chai.assert.equal(page.find(".alert-danger").length, 1, "no error shown");
      chai.assert.equal(page.find(".alert-danger").text(), errMsg, "wrong error message");
      done();
    })
  });

  it("expects input fields changes value", () => {
    const usernameInput = page.find("#login-email");
    const usernamePassword = page.find("#login-password");
    const email = "test@test.com";
    const password = "1qazXSW@#ddfea";
    usernameInput.simulate("change", {
      target: { value: email },
    });
    usernamePassword.simulate("change", {
      target: { value: password },
    });

    chai.assert.equal(page.state().email, email, "set email wrong");
    chai.assert.equal(page.state().password, password, "set password wrong");
  })
});
