import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import CustomImage from "../CustomImage";

describe("CustomImage component", () => {
  const mockProps = {
    src: "url(fake-src)",
    supportSrc: "url(support-fake-src)",
    alt: "fake-image",
  };
  const component = mount(<CustomImage {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have image", () => {
    chai.assert.equal(component.find("img").length, 1);
  });
});
