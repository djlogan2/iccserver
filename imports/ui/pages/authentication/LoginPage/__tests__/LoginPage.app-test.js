import React from "react";
import { chai } from "meteor/practicalmeteor:chai";
import { mount } from "enzyme";

// XXX: should be able to get sinon from npm, but https://github.com/meteor/meteor/issues/6427
// import { sinon } from 'sinon';
import { sinon } from "meteor/practicalmeteor:sinon";

import LoginPage from "../LoginPage";
const { expect } = chai;

describe("<LoginPage />", () => {
  it("calls componentDidMount", () => {
    sinon.spy(LoginPage.prototype, "componentDidMount");

    mount(<LoginPage />);

    // expect(wrapper.find('div.list-item')).to.have.length(1);
    expect(LoginPage.prototype.componentDidMount.calledOnce).to.equal(true);

    LoginPage.prototype.componentDidMount.restore();
  });
});
