import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import GameListModal from "../GameListModal";

describe("GameListModal component", () => {
  const component = mount(<GameListModal />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});