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

const EnhancedGameRequestPopup = translate("Common.GameRequestPopup")(GameRequestPopup);

class ActionPopup extends Component {
  responseHandler = (actionType, action, gameId) => {
    switch (action) {
      case "takeBack":
        this.takeBack(actionType, gameId);
        break;

      case "draw":
        this.draw(actionType, gameId);
        break;

      case "abort":
        this.abort(actionType, gameId);
        break;

      case "adjourn":
        this.adjourn(actionType, gameId);
        break;
      default:
    }
  };

  takeBack = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptTakeBack", "takeBackAccept", gameId);
    else Meteor.call("declineTakeback", "takeBackDecline", gameId);
  };

  draw = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptDraw", "drawAccept", gameId);
    else Meteor.call("declineDraw", "drawDecline", gameId);
  };

  abort = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptAbort", "abortAccept", gameId);
    else Meteor.call("declineAbort", "abortDecline", gameId);
  };

  adjourn = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptAdjourn", "adjournAccept", gameId);
    else Meteor.call("declineAdjourn", "adjournDecline", gameId);
  };

  render() {
    const { title, action, cssManager, gameID: gameId } = this.props;

    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            marginTop: "0px",
            alignItems: "center",
            color: "#fff",
            border: "1px solid #f88117",
            position: "absolute",
            right: "8px",
            background: "#f88117e0",
            width: "auto",
            top: "15px",
            zIndex: "9",
            webkitBoxShadow: "#949392 3px 2px 4px 0px",
            mozBoxShadow: "#949392 3px 2px 4px 0px",
            boxShadow: "#949392 3px 2px 4px 0px",
            borderRadius: "4px",
            padding: "10px 15px"
          }}
        >
          <img
            src={cssManager.buttonBackgroundImage("infoIcon")}
            style={{ width: "18px", marginRight: "10px" }}
            alt="info"
          />
          <strong style={{ width: "auto", marginRight: "6px", fontSize: "14px" }}>{title}</strong>
          <button
            onClick={() => this.responseHandler("accepted", action, gameId)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={cssManager.buttonBackgroundImage("checkedIcon")}
              style={{ width: "18px" }}
              alt="accept"
            />
          </button>
          <button
            onClick={() => this.responseHandler("rejected", action, gameId)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={cssManager.buttonBackgroundImage("closeIcon")}
              style={{ width: "15px" }}
              alt="close"
            />
          </button>
        </div>
      </div>
    );
  }
}

class GameNotificationPopup extends Component {
  removeAcknowledgeMessage(messageId) {
    Meteor.call("acknowledge.client.message", messageId);
  }

  render() {
    const { title, mid, translate, cssManager } = this.props;

    const style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
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
            onClick={() => this.removeAcknowledgeMessage(mid)}
            style={cssManager.innerPopupMain()}
          >
            {translate("close")}
          </button>
        </div>
      </div>
    );
  }
}

const EnhancedGameNotificationPopup = translate("Common.GamenotificationPopup")(
  GameNotificationPopup
);

class ExaminActionPopup extends Component {
  render() {
    const { action, translate, examinActionCloseHandler, cssManager } = this.props;

    const style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };
    if (action === "complain") {
      return (
        <div style={style}>
          <div className="popup_inner">
            <div>
              <label>{translate("email")}</label>
              <input type="text" name="email" />
            </div>
            <div>
              <label>{translate("complaint")}</label>
              <textarea name="complaint" rows="4" cols="35" />
            </div>
            <div>
              <button
                onClick={() => examinActionCloseHandler()}
                style={cssManager.innerPopupMain()}
              >
                {translate("submit")}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (action === "emailgame") {
      return (
        <div style={style}>
          <div className="popup_inner">
            <div>
              <label>{translate("email")}</label>
              <input type="text" name="email" />
            </div>

            <div>
              <button
                onClick={() => examinActionCloseHandler()}
                style={cssManager.innerPopupMain()}
              >
                {translate("submit")}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}

const EnhancedExaminActionPopup = translate("Common.ExaminActionPopup")(ExaminActionPopup);

class GameResignedPopup extends Component {
  render() {
    const { title, resignNotificationCloseHandler, cssManager, translate } = this.props;

    return (
      <div
        style={{
          width: "385px",
          height: "auto",
          borderRadius: "15px",
          background: "#ffffff",
          position: "fixed",
          zIndex: "99",
          left: "0px",
          right: "25%",
          margin: "0px auto",
          top: "27%",
          padding: "20px",
          textAlign: "center",
          border: "1px solid #ccc",
          boxShadow: "#0000004d"
        }}
      >
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
            onClick={() => resignNotificationCloseHandler()}
            style={cssManager.innerPopupMain()}
          >
            {translate("close")}
          </button>
        </div>
      </div>
    );
  }
}

const EnhancedGameResignedPopup = translate("Common.GameResignedPopup")(GameResignedPopup);

export {
  EnhancedGameResignedPopup,
  EnhancedExaminActionPopup,
  EnhancedGameRequestPopup,
  ActionPopup,
  EnhancedGameNotificationPopup
};
