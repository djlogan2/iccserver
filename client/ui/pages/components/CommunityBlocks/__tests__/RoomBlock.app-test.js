import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import RoomBlock from "../RoomBlock";

describe("RoomBlock component", () => {
  const mockProps = { list: [{ _id: "fake_id", name: "fake" }], activeRoom: "fake_id" };
  const component = mount(<RoomBlock {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});