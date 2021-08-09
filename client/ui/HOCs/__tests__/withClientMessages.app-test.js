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
            _id: "fake_id_1",
            message: "fake_message_1",
            message_identifier: "fake_message_identifier",
          },
          {
            _id: "fake_id_2",
            message: "fake_message",
            message_identifier: "matchRequest",
          },
        ]}
      />
    );

    chai.assert.isDefined(component);
  });
});
