import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import { translate } from "../translate";

describe("translate HOC", () => {
  it("should render div with translate HOC", () => {
    const WrappedComponent = translate("fake_name")(<div />);
    const component = shallow(<WrappedComponent />);

    chai.assert.isDefined(component);
  });
});
