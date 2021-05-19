import React from "react";

export default class FallenSoldierSquare extends React.Component {
  render() {
    const { side, cssManager, color, piece } = this.props;
    let { count } = this.props;

    const h = side / 5.7;
    const w = side / 5.7;

    if (count > 1) {
      count = count - 1;
      count = "+".concat(count);
    } else {
      count = null;
    }

    const peiceImage = cssManager.fSquareStyle(color, piece);

    const imageSide = {
      width: h,
      height: w,
    };

    const imageStyle = {
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      backgroundPosition: "center",
      borderRadius: "3px",
      color: "#fff",
      backgroundColor: "none",
      position: "relative",
    };

    const countStyle = {
      width: h / 1.5,
      height: w / 1.5,
      background: "#1565c0",
      borderRadius: "50px",
      fontSize: "11px",
      padding: "2px",
      border: "#fff solid 1px",
      top: "-4px",
      left: "-3px",
      position: "absolute",
    };

    const notcountStyle = {
      width: h / 1.5,
      height: w / 1.5,
      borderRadius: "50px",
      fontSize: "11px",
      padding: "2px",
      top: "-4px",
      left: "-3px",
      position: "absolute",
    };

    const spanStyle = count ? countStyle : notcountStyle;

    return (
      <div style={{ display: "inline-block" }}>
        <div style={imageStyle}>
          <img src={peiceImage} alt={piece} style={imageSide} />
          <span style={spanStyle}>{count}</span>
        </div>
      </div>
    );
  }
}
