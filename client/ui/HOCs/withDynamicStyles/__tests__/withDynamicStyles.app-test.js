import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import { withDynamicStyles } from "..";

describe("withDynamicStyles HOC", () => {
  const mock = {
    test: {}
  }
  
  const TestComponent = () => <div></div>;

  it("should render", () => {
    const WrappedComponent = withDynamicStyles(mock)(TestComponent);
    const component = shallow(<WrappedComponent />);

    chai.assert.isDefined(component);
  });
});
