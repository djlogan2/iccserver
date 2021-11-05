import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import ExportPgnButton from "../ExportPgnButton";

describe("ExportPgnButton component", () => {
  const mockProps = { id: "test_id", src: "url(fake_src)" };
  const component = mount(<ExportPgnButton {...mockProps} />);

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });
});
