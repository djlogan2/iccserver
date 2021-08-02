import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import SecurityCard from "../SecurityCard";

describe("SecurityCard component", () => {
  it("should render", () => {
    const component = mount(<SecurityCard />);

    chai.assert.isDefined(component);
  })
});
