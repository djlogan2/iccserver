import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import withClientMessages from "../withClientMessages";

describe("withClientMessages HOC", () => {
  it("should render", () => {
    const WrappedComponent = withClientMessages(<div />);
    const component = mount(
      <WrappedComponent
        userClientMessages={[
          {
            _id: "fake_id",
            message: "fake_message",
            message_identifier: "fake_message_identifier",
          },
        ]}
      />
    );

    chai.assert.isDefined(component);
  });
});
