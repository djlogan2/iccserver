import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayWithFriend from "../PlayWithFriend";

describe("PlayWithFriend component", () => {
  // beforeEach(() => {
  //   sinon.replace(Meteor, "users", () => {
  //     return {
  //       find: () => {
  //         return { fetch: () => [{ _id: "fake_id", username: "fake_username" }] };
  //       },
  //     };
  //   });
  // });
  //
  // afterEach(() => {
  //   sinon.restore();
  // });

  it("should render", () => {
    const component = mount(<PlayWithFriend />);

    chai.assert.isDefined(component);
  });
});
