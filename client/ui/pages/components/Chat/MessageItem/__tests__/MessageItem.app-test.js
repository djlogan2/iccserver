import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import MessageItem from "../MessageItem";

describe("MessageItem component", () => {
  const mockProps = { name: "Name", text: "Text" };
  const component = mount(<MessageItem {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have two divs", () => {
    chai.assert.equal(component.find("div").length, 2);
  });

  it("should have one p", () => {
    chai.assert.equal(component.find("p").length, 1);
  })
});
