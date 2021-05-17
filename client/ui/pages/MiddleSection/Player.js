import React, { Component } from "react";
import FallenSoldier from "./FallenSoldier";

import { translate } from "../../HOCs/translate";

class Player extends Component {
  render() {
    const {
      cssManager,
      side,
      playerData,
      turnColor,
      message,
      color,
      FallenSoldiers,
      translate,
    } = this.props;

    const userPicture = cssManager.userPicture(side * 0.08);
    const tagLine = cssManager.tagLine();

    return (
      <div
        style={{
          width: side * 0.8,
          display: "inline-block",
          marginTop: "5px",
          marginBottom: "5px",
          position: "relative",
        }}
      >
        <div style={{ width: side * 0.45, display: "inline-block", position: "relative" }}>
          <img
            style={{ display: "inline-block", float: "left", ...userPicture }}
            src="images/player-img-top.png"
            alt={translate("userPicture")}
          />
          <div style={{ marginTop: "5px", float: "left", ...tagLine }}>
            <div
              style={{
                display: "inline-block",
                maxWidth: side * 0.25,
                wordBreak: "break-word",
                verticalAlign: "middle",
                marginTop: "5px",
              }}
            >
              <p
                style={{
                  color: "#fff",
                  fontSize: side * 0.022,
                  fontWeight: "600",
                  marginRight: "15px",
                  display: "block",
                  width: "100%",
                }}
              >
                {playerData.name} ({playerData.rating})
              </p>
            </div>

            <div style={{ position: "absolute", bottom: "0", paddingRight: "40px" }}>
              <span
                style={{
                  color: turnColor,
                  fontSize: side * 0.019,
                }}
              >
                {message}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            width: side * 0.35,
            display: "inline-block",
            verticalAlign: "top",
            marginTop: "5px",
          }}
        >
          <FallenSoldier
            cssManager={cssManager}
            side={side * 0.35}
            color={color}
            FallenSoldiers={FallenSoldiers}
          />
        </div>
      </div>
    );
  }
}

export default translate("Common.Player")(Player);
