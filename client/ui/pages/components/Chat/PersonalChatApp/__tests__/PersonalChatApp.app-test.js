import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PersonalChatApp from "../PersonalChatApp";

describe("PersnalChatApp component", () => {
  const component = mount(<PersonalChatApp />);

  it("should render", () => {
    chai.assert.isDefined(component);

    component.find("Input").simulate("change", { target: { value: "new_value" } });
    component.find("form").simulate("submit");
  });
});
