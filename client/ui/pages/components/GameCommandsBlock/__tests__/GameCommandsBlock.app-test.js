import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import GameCommandsBlock from "../GameCommandsBlock";

describe("GameCommandsBlock component", () => {
  const component = mount(<GameCommandsBlock />);

  it("should render", () => {
    chai.assert.isDefined(component);
  })
});