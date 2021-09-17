import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import RoomBlock from "../RoomBlock";

describe("RoomBlock component", () => {
  const mockProps = {
    list: [{ _id: "fake_id", name: "fake" }],
    activeRoom: "fake_id",
    isModal: true,
    onChange: () => null,
    handleCloseModal: () => null,
  };

  it("should render and simulate options", () => {
    const component = mount(<RoomBlock {...mockProps} />);

    chai.assert.isDefined(component);

    component.find("li").simulate("click");
    component.find("li").simulate("keyDown", { key: "Enter" });
    component.find("Input").simulate("change", { target: { value: "new_value" } });
    component.find("Modal").simulate("submit");
    component.find("Modal").simulate("cancel");
    chai.assert.equal(component.find("Modal").length, 1);
  });
});
