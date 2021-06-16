import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import FallenSoldier from "../FallenSoldier";

describe("FallenSoldier component", () => {
  const mockProps = { soldiers: { pawn: 1 }, color: "white", side: 10 };
  const mockProps1 = { soldiers: { pawn: 3 }, color: "white", side: 10 };
  const component = mount(<FallenSoldier {...mockProps} />);
  const component1 = mount(<FallenSoldier {...mockProps1} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  it("should render with multiple count", () => {
    chai.assert.isDefined(component1);
  });
});
