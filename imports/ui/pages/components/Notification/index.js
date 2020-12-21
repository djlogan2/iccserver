import React from "react";
import { notification } from "antd";
import { Meteor } from "meteor/meteor";

const renderNotification = ({ title, action, cssManager, gameId }) => {
  const key = `notification-${action}-${gameId}`;

  const responseHandler = (actionType) => {
    switch (action) {
      case "takeBack":
        takeBack(actionType, gameId);
        break;

      case "draw":
        draw(actionType, gameId);
        break;

      case "abort":
        abort(actionType, gameId);
        break;

      case "adjourn":
        adjourn(actionType, gameId);
        break;
      default:
    }

    notification.close(key);
  };

  const takeBack = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptTakeBack", "takeBackAccept", gameId);
    else Meteor.call("declineTakeback", "takeBackDecline", gameId);
  };

  const draw = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptDraw", "drawAccept", gameId);
    else Meteor.call("declineDraw", "drawDecline", gameId);
  };

  const abort = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptAbort", "abortAccept", gameId);
    else Meteor.call("declineAbort", "abortDecline", gameId);
  };

  const adjourn = (isAccept, gameId) => {
    if (isAccept === "accepted") Meteor.call("acceptAdjourn", "adjournAccept", gameId);
    else Meteor.call("declineAdjourn", "adjournDecline", gameId);
  };

  const renderDescription = () => {
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
            onClick={() => responseHandler("accepted")}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={cssManager.buttonBackgroundImage("checkedIcon")}
              style={{ width: "18px" }}
              alt="accept"
            />
          </button>
          <button
            onClick={() => responseHandler("rejected")}
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
  };

  notification.open({
    key,
    message: title,
    description: renderDescription(),
    duration: 10
  });

  return null;
};

export default renderNotification;