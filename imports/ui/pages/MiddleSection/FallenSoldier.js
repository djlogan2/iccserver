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
             cssManager={this.props. cssManager}
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
    const h = this.props.side / 5.7;
    const w = this.props.side / 5.7;
    let count = this.props.count;

    if (count > 1) {
      count = count - 1;
      count = "+".concat(count);
    } else {
      count = null;
    }
    const side = Math.min(h, w);
    const peiceImage = this.props. cssManager.fSquareStyle(this.props.color, this.props.piece);
    let imageSide = {
      width: h,
      height: w
    };
    const imageStyle = {
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      backgroundPosition: "center",
      borderRadius: "3px",
      color: "#fff",
      backgroundColor: "none",
      position: "relative"
    };
    let countStyle = {
      width: h / 1.5,
      height: w / 1.5,
      background: "#1565c0",
      borderRadius: "50px",
      fontSize: "11px",
      padding: "2px",
      border: "#fff solid 1px",
      top: "-4px",
      left: "-3px",
      position: "absolute"
    };
    let notcountStyle = {
      width: h / 1.5,
      height: w / 1.5,
      borderRadius: "50px",
      fontSize: "11px",
      padding: "2px",
      top: "-4px",
      left: "-3px",
      position: "absolute"
    };
    let spanStyle = count ? countStyle : notcountStyle;
    return (
      <div style={{ display: "inline-block" }}>
        <div style={imageStyle}>
          <img src={peiceImage} alt="" style={imageSide} />
          <span style={spanStyle}>{count}</span>{" "}
        </div>
      </div>
    );
    // return <div style={{ display: "inline-block"}}><div style={squareStyle}>{count? (<span style={spanStyle}>{count}</span>):null} </div></div>
  }
}
