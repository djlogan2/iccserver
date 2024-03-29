import React from "react";
import chai from "chai";
import { mount } from "enzyme";

import CustomColorPicker from "../CustomColorPicker";

describe("CustomColorPicker component", () => {
  const mockProps = { color: "#fafafa", onChange: () => null };
  const component = mount(<CustomColorPicker {...mockProps} />);
  it("should render", () => {
    chai.assert.isDefined(component);
  });

  // it("should have no SketchPicker", () => {
  //   chai.assert.equal(component.find(SketchPicker).length, 0);
  // });

  // it("should have SketchPicker", () => {
  //   component.find("div#open-scetch-picker").simulate("click");
  //   chai.assert.equal(component.find(SketchPicker).length, 1);
  //
  //   const picker = component.find(SketchPicker);
  //   picker.simulate("change", { target: { value: "#ffffff" } });
  //
  //   component.find("div#close-scetch-picker").simulate("click");
  //   chai.assert.equal(component.find(SketchPicker).length, 0);
  // });
});
