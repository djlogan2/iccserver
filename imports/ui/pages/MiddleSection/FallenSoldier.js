/* eslint-disable react/style-prop-object */
import React from "react";
import CssManager from "../components/Css/TestContainerCssManager";
const css = new CssManager("developmentcss");
export default class FallenSoldier extends React.Component {
  render() {
    let soldiers = this.props.FallenSoldiers;

    let wSoldiers = soldiers
      ? soldiers.map((wSoldier, index) => {
          return (
            <FallenSoldierSquare
              key={index}
              piece={wSoldier}
              color={this.props.color}
              cssmanager={css}
              side={this.props.side}
            />
          );
        })
      : null;

    return <div>{wSoldiers}</div>;
  }
}

class FallenSoldierSquare extends React.Component {
  render() {
    console.log("this.props.color", this.props.color);
    const h = this.props.side / 20;
    const w = this.props.side / 20;

    this._square_side = Math.min(h, w);
    const squareStyle = this.props.cssmanager.fSquareStyle(
      this.props.color,
      this.props.piece,
      this._square_side
    );

    return <div style={squareStyle} />;
  }
}
