import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import FallenSoldierSquare from "../FallenSoldierSquare";

describe("FallenSoldierSquare component", () => {
  const mockProps = { side: 10, color: "white", piece: "pawn", count: 3 };
  const component = mount(<FallenSoldierSquare {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
