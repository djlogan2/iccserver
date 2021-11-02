import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import SecurityCard from "../SecurityCard";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("SecurityCard component", () => {
  beforeEach(() => {
    sinon.replace(
      Meteor,
      "call",
      (methodName, methodDesc, currUserId, isolationGroup, callback) => {
        if (methodName === "setOtherIsolationGroup") {
          callback("fake_error");
        }
      }
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  const mockProps = {
    currentUser: { _id: "id", isolation_group: "public" },
    isolationGroups: [{ _id: "public", name: "public", value: "public" }],
  };
  const component = mount(<SecurityCard {...mockProps} />);

  it("should render", () => {
    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
    });
  });

  it("should simulate input change", () => {
    Promise.resolve(component).then(() => {
      const input1 = component.find("Input#new-password-input");
      const input2 = component.find("Input#confirm-password-input");
      chai.assert.equal(input1.length, 1);

      input1.simulate("change", { target: { value: "password_value" } });
      input2.simulate("change", { target: { value: "password_value1" } });

      const button = component.find("Button#update-password");
      button.simulate("click");

      input1.simulate("change", { target: { value: "password_value" } });
      input2.simulate("change", { target: { value: null } });

      button.simulate("click");

      input1.simulate("change", { target: { value: "password_value" } });
      input2.simulate("change", { target: { value: "password_value" } });

      button.simulate("click");
    });
  });
});
