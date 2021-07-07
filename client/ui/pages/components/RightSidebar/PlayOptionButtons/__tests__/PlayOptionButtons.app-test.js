import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayOptionButtons from "../PlayOptionButtons";

describe("PlayOptionButtons component", () => {
  const mockProps = {
    handlePlaySeek: () => null,
    handlePlayWithFriend: () => null,
    handlePlayComputer: () => null,
  };
  const component = mount(<PlayOptionButtons {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should click one minute seek", () => {
    const button = component.find("Button#one-minute-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });

  it("should click one three minutes seek", () => {
    const button = component.find("Button#three-minutes-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });

  it("should click five minutes seek", () => {
    const button = component.find("Button#five-minutes-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });

  it("should click ten minutes seek", () => {
    const button = component.find("Button#ten-minutes-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });

  it("should click fifteen minutes seek", () => {
    const button = component.find("Button#fifteen-minutes-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });

  it("should click twenty five minutes seek", () => {
    const button = component.find("Button#twenty-five-minutes-seek");

    chai.assert.equal(button.length, 1);
    button.simulate("click");
  });
});
