import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import CommunityRightBlock from "../CommunityRightBlock";

describe("CimmunityRightBlock component", () => {
  const mockProps = { activeRoom: "fake_id", roomList: [{ id: "fake_id", name: "fake" }], onChange: () => null };
  const component = mount(<CommunityRightBlock {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should call onChange", () => {
    const element = component.find("li").first();
    chai.assert.equal(component.find("li").length, 1);

    element.simulate("click");
  })
});
