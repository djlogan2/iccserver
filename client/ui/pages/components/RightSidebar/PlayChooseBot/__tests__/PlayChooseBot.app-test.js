import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayChooseBot from "../PlayChooseBot";

describe("PlayChooseBot component", () => {
  const mockProps = { onPlay: () => null };
  const component = mount(<PlayChooseBot {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should call start the game button", () => {
    const button = component.find("Button#start-the-game-button");
    button.simulate("click");
  });

  it("should handle change initial", () => {
    const button = component.find("InputNumber#initial");
    button.simulate("change", { target: { value: 2 } });
  });
});
