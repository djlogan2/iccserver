import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import FallenSoldierSquare from "../FallenSoldierSquare";
import CssManager from "../../components/Css/CssManager";

describe("FallenSoldierSquare component", () => {
  const mockProps = {
    side: 10,
    color: "white",
    piece: "pawn",
    count: 3,
    cssManager: new CssManager({}, {}),
  };
  const component = mount(<FallenSoldierSquare {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
