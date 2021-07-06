import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { GameControlBlock } from "../GameControlBlock";

describe("GameControlBlock component", () => {
  const mockProps = { game: {}, flip: () => null };
  const component = mount(<GameControlBlock {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
