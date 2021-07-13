import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { withPlayNotifier } from "../withPlayNotifier";

describe("withPlayNotifier HOC", () => {
  const mockProps = {
    inGame: { status: "playing", pending: { white: { takeback: { number: 1 } } } },
  };
  const WrappedComponent = withPlayNotifier(<div />);
  const component = mount(<WrappedComponent {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
