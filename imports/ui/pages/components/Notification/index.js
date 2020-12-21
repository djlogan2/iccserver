import React from "react";
import { notification } from "antd";
import { Meteor } from "meteor/meteor";

const renderNotification = ({ title, action, cssManager, gameId }) => {
  const key = `notification-${action}-${gameId}`;

  const responseHandler = actionType => {
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
        break;
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
        <button
          onClick={() => responseHandler("accepted")}
          style={{ backgroundColor: "transparent", width: "50%", border: "0px" }}
        >
          <img
            src={cssManager.buttonBackgroundImage("checkedIcon")}
            style={{ width: "18px" }}
            alt="accept"
          />
        </button>
        <button
          onClick={() => responseHandler("rejected")}
          style={{ backgroundColor: "transparent", width: "50%", border: "0px" }}
        >
          <img
            src={cssManager.buttonBackgroundImage("closeIcon")}
            style={{ width: "15px" }}
            alt="close"
          />
        </button>
      </div>
    );
  };

  const renderTitle = () => {
    return (
      <div style={{ width: "100%" }}>
        <img
          src={cssManager.buttonBackgroundImage("infoIcon")}
          style={{ width: "18px", marginRight: "10px", marginBottom: "5px" }}
          alt="info"
        />
        <strong style={{ width: "auto", marginRight: "6px", fontSize: "18px", color: "#fff" }}>
          {title}
        </strong>
      </div>
    );
  };

  notification.open({
    key,
    duration: 0,
    closeIcon: () => null,
    style: { height: "85px", backgroundColor: "#FF9806", color: "#fff" },
    message: renderTitle(),
    description: renderDescription()
  });
};

export default renderNotification;
