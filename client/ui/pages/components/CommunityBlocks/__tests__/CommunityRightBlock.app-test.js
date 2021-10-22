import React from "react";

describe("CommunityRightBlock component", () => {
  const mockProps = {
    activeRoom: "fake_id",
    roomList: [{ _id: "fake_id", name: "fake" }],
    onChange: () => null,
    handleOpenModal: () => null,
  };

  // it("should render", () => {
  //   const component = mount(<CommunityRightBlock {...mockProps} />);
  //   chai.assert.isDefined(component);
  // });

  // it("should call onChange", () => {
  //   const component = mount(<CommunityRightBlock {...mockProps} />);
  //
  //   const element = component.find("li").first();
  //   chai.assert.equal(component.find("li").length, 1);
  //
  //   element.simulate("click");
  // });
});
