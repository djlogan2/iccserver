import React from "react";
import { notification, Button } from "antd";

import {
  colorBlack,
  colorWhite,
  nonRatedGame,
  ratedGame
} from "../../../../../constants/gameConstants";

const gameRequestNotification = (gameRequest, translate, classes, onAcceptGame, onDeclineGame) => {
  const renderDescription = () => {
    return (
      <div>
        <div className={classes.mainDiv}>
          <img
            src="images/avatar.png"
            alt={translate("userAvatar")}
            className={classes.imageAvatar}
          />
          <div>
            <span>
              {translate("description", {
                username: gameRequest.challenger,
                rating: gameRequest.challenger_rating
              })}
            </span>
            <div className={classes.detailsDiv}>
              {translate("details", {
                time: `${gameRequest.challenger_time} ${gameRequest.challenger_inc_or_delay}`,
                ratingType: gameRequest.rating_type,
                isRated: gameRequest.rated ? ratedGame : nonRatedGame,
                color: gameRequest.challenger_color_request === colorWhite ? colorBlack : colorWhite
              })}
            </div>
          </div>
        </div>
        <div className={classes.actionsDiv}>
          <Button onClick={onDeclineGame} className={classes.declineButton}>
            {translate("decline")}
          </Button>
          <Button onClick={onAcceptGame} className={classes.acceptButton}>
            {translate("accept")}
          </Button>
        </div>
      </div>
    );
  };

  const renderTitle = () => <div className={classes.divTitle}>{translate("dialogTitle")}</div>;

  notification.open({
    key: gameRequest._id,
    duration: 0,
    closeIcon: () => null,
    style: {
      position: "relative",
      left: "15rem",
      borderRadius: "5.76258px"
    },
    message: renderTitle(),
    description: renderDescription(),
    placement: "topLeft"
  });
};

export default gameRequestNotification;
