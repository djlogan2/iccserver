import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { SketchPicker } from "react-color";

import CustomColorPicker from "../CustomColorPicker";

describe("CustomColorPicker component", () => {
  const mockProps = { color: "#fafafa", onChange: () => null };
  const component = mount(<CustomColorPicker {...mockProps} />);
  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should have no SketchPicker", () => {
    chai.assert.equal(component.find(SketchPicker).length, 0);
  });

  it("should have SketchPicker", () => {
    component.setState({ isOpen: true }, () => {
      chai.assert.equal(component.find(SketchPicker).length, 1);
    });
  });

  it("should change color picker color", () => {
    const picker = component.find(SketchPicker).first();
    picker.simulate("change", { target: { value: "#ffffff" } });
  });
});
