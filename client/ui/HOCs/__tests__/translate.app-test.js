import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { translate } from "../translate";

describe("translate HOC", () => {
  const component = mount(translate("fake_name")(<div />));

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
