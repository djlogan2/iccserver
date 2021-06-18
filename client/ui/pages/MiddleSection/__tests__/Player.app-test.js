import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Player from "../Player";
import CssManager from "../../components/Css/CssManager";

describe("Player component", () => {
  const css = new CssManager({}, {});
  const mockProps = {
    playerData: { name: "fake_name", editable: true, locale: "us-us" },
    side: 100,
    cssManager: css,
    turnColor: "white",
    message: "fake_message",
    color: "white",
    FallenSoldiers: [],
    gameId: "fake_id",
  };

  const mockProps1 = {
    playerData: { name: "fake_name", editable: true },
    side: 100,
    cssManager: css,
    turnColor: "white",
    message: "fake_message",
    color: "white",
    FallenSoldiers: [],
    gameId: "fake_id",
  };

  it("should render", () => {
    const component = mount(<Player {...mockProps} />);

    chai.assert.isDefined(component);
  });

  it("should render without locale", () => {
    const component = mount(<Player {...mockProps1} />);

    chai.assert.isDefined(component);
  });

  it("should check handleEdit function and change username", () => {
    const component = mount(<Player {...mockProps} />);

    const pActive = component.find("p").first();
    pActive.simulate("doubleClick");
    component.find("Input").simulate("change", { target: { value: "new_username1" } });
    component.find("Button").simulate("click");
  });
});
