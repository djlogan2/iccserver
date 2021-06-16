import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayBlock from "../PlayBlock";

describe("PlayBlock component", () => {
  const component = mount(<PlayBlock />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
