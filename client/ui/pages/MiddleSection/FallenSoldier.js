import React from "react";
import FallenSoldierSquare from "./FallenSoldierSquare";

export default class FallenSoldier extends React.Component {
  render() {
    const { side, color, cssManager, soldiers } = this.props;
    const soldiersKeys = Object.keys(soldiers || {});

    const items = [];

    soldiersKeys.forEach((key) => {
      if (soldiers[key]) {
        items.push(
          <FallenSoldierSquare
            key={key}
            piece={key}
            color={color}
            cssManager={cssManager}
            side={side}
            count={soldiers[key]}
          />
        );
      }
    });

    return items;
  }
}
