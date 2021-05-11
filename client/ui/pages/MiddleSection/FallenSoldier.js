import React from "react";
import FallenSoldierSquare from "./FallenSoldierSquare";

export default class FallenSoldier extends React.Component {
  render() {
    const { side, color, cssManager, FallenSoldiers: soldiers } = this.props;

    const items = [];

    if (soldiers && soldiers.length) {
      soldiers.forEach((soldier, index) => {
        if (soldier) {
          items.push(
            <FallenSoldierSquare
              key={index}
              piece={index}
              color={color}
              cssManager={cssManager}
              side={side}
              count={soldier}
            />
          );
        }
      });
    }

    return items;
  }
}
