import React from "react";
import { notification } from "antd";
import { Meteor } from "meteor/meteor";

const renderNotification = ({ title, action, cssManager, gameId, classes, translate }) => {
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

  const renderTitle = () => {
    return (
      <div className={classes.mainDiv}>
        <div>
          <img
            src={cssManager.buttonBackgroundImage("infoIcon")}
            className={classes.titleIcon}
            alt={translate("info")}
          />
          <strong className={classes.titleText}>{title}</strong>
        </div>
        <div>
          <button onClick={() => responseHandler("accepted")} className={classes.descriptionButton}>
            <strong className={classes.titleText}>{translate("accept")}</strong>
          </button>
          <button onClick={() => responseHandler("rejected")} className={classes.descriptionButton}>
            <img
              src={cssManager.buttonBackgroundImage("closeIcon")}
              className={classes.closeIcon}
              alt={translate("close")}
            />
          </button>
        </div>
      </div>
    );
  };

  notification.open({
    key,
    duration: 0,
    closeIcon: () => null,
    style: { height: "55px", backgroundColor: "#800000", color: "#fff" },
    message: renderTitle(),
    description: null,
  });
};

export default renderNotification;
