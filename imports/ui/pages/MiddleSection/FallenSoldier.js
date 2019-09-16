import React from "react";
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
              cssmanager={this.props.cssmanager}
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
    const h = this.props.side / 30;
    const w = this.props.side / 30;

    this._square_side = Math.min(h, w);
    const squareStyle = this.props.cssmanager.fSquareStyle(
      this.props.color,
      this.props.piece,
      this._square_side
    );

    return <div style={squareStyle} />;
  }
}
