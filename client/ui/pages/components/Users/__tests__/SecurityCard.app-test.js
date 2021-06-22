import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import SecurityCard from "../SecurityCard";

describe("SecurityCard component", () => {
  const mockProps = {
    currentUser: { _id: "id", isolation_group: "public" },
    isolationGroups: [{ _id: "public", name: "public", value: "public" }],
  };
  const component = mount(<SecurityCard {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should simulate input change", () => {
    const input1 = component.find("Input#new-password-input");
    const input2 = component.find("Input#confirm-password-input");
    input1.simulate("change", { target: { value: "password_value" } });
    input2.simulate("change", { target: { value: "password_value" } });
  });
});
