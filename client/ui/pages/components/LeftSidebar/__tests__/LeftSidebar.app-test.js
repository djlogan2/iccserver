import React from "react";
import { Meteor } from "meteor/meteor";
import chai from "chai";
import sinon from "sinon";
import { mount, shallow } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import LeftSidebar, { LeftSidebar_Pure } from "../LeftSidebar";

describe("LeftSidebar component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_id",
    status: { game: "none" },
    cf: "c",
  };

  beforeEach(() => {
    sinon.stub(Meteor, "user");
    Meteor.user.returns(currentUser);

    sinon.stub(Meteor, "userId");
    Meteor.userId.returns(currentUser._id);

    sinon.stub(Meteor, "logout");
    Meteor.logout.returns();

    sinon.replace(Meteor, "call", (methodName, methodDesc, userId, resource, callback) => {
      if (methodName === "setClientStatus") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
    Meteor.logout.restore();

    sinon.restore();
  });

  it("should render", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.isDefined(wrapper);
    });
  });

  it("should fliph", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find(LeftSidebar).length, 1);
      const button = wrapper.find("button");
      button.simulate("click");
    });
  });

  it("should redirect to profile", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find(LeftSidebar).length, 1);
      const div = wrapper.find("#profile-redirect");
      div.simulate("click");
      chai.assert.equal(location.pathname, "/profile");
    });
  });

  it("should logout", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find(LeftSidebar).length, 1);
      const div = wrapper.find("a#logout");
      div.simulate("click");
    });
  });

  it("should open my games dialog", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find(LeftSidebar).length, 1);
      const div = wrapper.find("a#mygame");
      div.simulate("click");
      chai.assert.equal(wrapper.find("Modal").length, 1);
      wrapper.find("Modal").simulate("cancel");
    });
  });

  it("should go to link examine", () => {
    const history = createBrowserHistory();
    const wrapper = mount(
      <Router history={history}>
        <LeftSidebar />
      </Router>
    );

    Promise.resolve(wrapper).then(() => {
      chai.assert.equal(wrapper.find(LeftSidebar).length, 1);
      const div = wrapper.find("a#examine");
      div.simulate("click");
      chai.assert.equal(location.pathname, "/examine");
    });
  });
});

describe("LeftSideBar Pure Component", () => {
  let page, history;
  beforeEach(() => {
    history = createBrowserHistory();
    page = shallow(<LeftSidebar_Pure classes={{}} translate={() => {}} />);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("state visible value is changed", () => {
    Promise.resolve(page).then(() => {
      const button = page.find("button");
      chai.assert.isFalse(page.state().visible, "wrong default value");
      button.simulate("click");
      chai.assert.isTrue(page.state().visible, "value don't change");
      button.simulate("click");
      chai.assert.isFalse(page.state().visible, "value don't change");
    });
  });
});
