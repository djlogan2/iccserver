import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayChooseBot from "../PlayChooseBot";

describe("PlayChooseBot component", () => {
  const mockProps = { onPlay: () => null };
  const component = mount(<PlayChooseBot {...mockProps} />);

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should call start the game button", () => {
    Promise.resolve(component).then(() => {
      const button = component.find("Button#start-the-game-button");
      button.simulate("click");
    });
  });

  it("should handle change initial", () => {
    Promise.resolve(component).then(() => {
      const button = component.find("InputNumber#challengerInitial");
      button.simulate("change", { target: { value: 2 } });
    });
  });
});
