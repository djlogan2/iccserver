import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
class GameRequestPopup extends Component {
  gameRequestHandler = (isAccept, requestId) => {
    if (isAccept === "gameAccept") Meteor.call("gameRequestAccept", "gameAccept", requestId);
    else Meteor.call("gameRequestDecline", "gameDecline", requestId);
  };
  render() {
    const title = this.props.title;
    const requestId = this.props.requestId;
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
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
            onClick={this.gameRequestHandler.bind(this, "gameAccept", requestId)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Accept
          </button>
          <button
            onClick={this.gameRequestHandler.bind(this, "gameDecline", requestId)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Decline
          </button>
        </div>
      </div>
    );
  }
}

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
    alert(gameId);
    if (isAccept === "accepted") Meteor.call("acceptAbort", "abortAccept", gameId);
    else Meteor.call("declineAbort", "abortDecline", gameId);
  };
  adjourn = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptAdjourn", "adjournAccept", gameId);
    else Meteor.call("declineAdjourn", "adjournDecline", gameId);
  };

  render() {
    const title = this.props.title;
    const action = this.props.action;
    const gameId = this.props.gameID;

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
            src={this.props.cssmanager.buttonBackgroundImage("infoIcon")}
            style={{ width: "18px", marginRight: "10px" }}
            alt="info"
          />
          <strong style={{ width: "auto", marginRight: "6px", fontSize: "14px" }}>{title}</strong>
          <button
            onClick={this.responseHandler.bind(this, "accepted", action, gameId)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("checkedIcon")}
              style={{ width: "18px" }}
              alt="accept"
            />
          </button>
          <button
            onClick={this.responseHandler.bind(this, "rejected", action, gameId)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("closeIcon")}
              style={{ width: "15px" }}
              alt="close"
            />
          </button>
        </div>
      </div>
    );
  }
}

export { GameRequestPopup, ActionPopup };
