import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Player from "../Player";
import CssManager from "../../components/Css/CssManager";

describe("Player component", () => {
  const css = new CssManager({} , {});
  const mockProps = {
    playerData: { name: "fake_name", editable: true, locale: "us-us" },
    side: 100,
    cssManager: css,
    turnColor: "white",
    message: "fake_message",
    color: "white",
    FallenSoldiers: [],
  };
  const component = mount(<Player {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
