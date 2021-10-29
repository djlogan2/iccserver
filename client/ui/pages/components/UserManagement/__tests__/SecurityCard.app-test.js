import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import SecurityCard from "../SecurityCard";

describe("SecurityCard component", () => {
  it("should render", () => {
    const component = mount(<SecurityCard />);

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
