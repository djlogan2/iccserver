import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { translate } from "../../../HOCs/translate";

class GameRequestPopup extends Component {
  gameRequestHandler = (isAccept, requestId) => {
    if (isAccept === "gameAccept") {
      Meteor.call("gameRequestAccept", "gameAccept", requestId);
    } else {
      Meteor.call("gameRequestDecline", "gameDecline", requestId);
    }
  };

  render() {
    const { title, requestId, translate, cssManager } = this.props;

    const style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99999",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };

    return (
      <div style={style}>
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#000",
              fontSize: "17px"
            }}
          >
            {title}
          </h3>
          <button
            onClick={() => this.gameRequestHandler("gameAccept", requestId)}
            style={cssManager.innerPopupMain()}
          >
            {translate("accept")}
          </button>
          <button
            onClick={() => this.gameRequestHandler("gameDecline", requestId)}
            style={cssManager.innerPopupMain()}
          >
            {translate("decline")}
          </button>
        </div>
      </div>
    );
  }
}

export default translate("Common.GameRequestPopup")(GameRequestPopup);
