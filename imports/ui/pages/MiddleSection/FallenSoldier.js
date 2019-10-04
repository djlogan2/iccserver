import React from "react";
export default class FallenSoldier extends React.Component {
  render() {
    let soldiers = this.props.FallenSoldiers;

    let items = [];
    for (var k in soldiers) {
      if (soldiers[k] !== 0) {
        items.push(
          <FallenSoldierSquare
            key={k}
            piece={k}
            color={this.props.color}
            cssmanager={this.props.cssmanager}
            side={this.props.side}
            count={soldiers[k]}
          />
        );
      }
    }

    return items;
  }
}

class FallenSoldierSquare extends React.Component {
  render() {
    const h = this.props.side / 2;
    const w = this.props.side / 2;
    let font_height_width = this.props.side * 0.75;
    let count = this.props.count;

    if (count > 1) {
      count = count - 1;
      count = "+".concat(count);
    } else {
      count = null;
    }
    this._square_side = Math.min(h, w);
    const squareStyle = this.props.cssmanager.fSquareStyle(
      this.props.color,
      this.props.piece,
      this._square_side
    );
    let countStyle = {
      background: "#1565c0",
      borderRadius: "50px",
      height: font_height_width,
      width: font_height_width,
      fontSize: "11px",
      padding: "2px",
      marginLeft: "13px",
      border: "#fff solid 1px"
    };
    let notcountStyle = {
      borderRadius: "50px",
      height: font_height_width,
      width: font_height_width,
      fontSize: "11px",
      padding: "2px",
      marginLeft: "13px"
    };
    let spanStyle = count ? countStyle : notcountStyle;
    return (
      <div style={{ display: "inline-block" }}>
        <div style={squareStyle}>
          <span style={spanStyle}>{count}</span>{" "}
        </div>
      </div>
    );
    // return <div style={{ display: "inline-block"}}><div style={squareStyle}>{count? (<span style={spanStyle}>{count}</span>):null} </div></div>
  }
}
