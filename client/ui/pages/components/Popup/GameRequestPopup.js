import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import { withRouter } from "react-router-dom";
import { get } from "lodash";
import { RESOURCE_PLAY } from "../../../../constants/resourceConstants";

class GameRequestPopup extends Component {
  gameRequestHandler = (isAccept, requestId) => {
    const { history } = this.props;

    if (isAccept === "gameAccept") {
      const pathName = get(history, "location.pathname");

      if (pathName !== RESOURCE_PLAY) {
        history.push(RESOURCE_PLAY);
      }
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
      boxShadow: "#0000004d",
    };

    return (
      <div style={style}>
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#000",
              fontSize: "17px",
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

export default compose(translate("Common.GameRequestPopup"), withRouter)(GameRequestPopup);
