import React from "react";
import { notification, Button } from "antd";

const gameRequestNotification = (gameRequest, translate, onAcceptGame, onDeclineGame) => {
  const renderDescription = () => {
    return (
      <div>
        <div style={{ display: "flex" }}>
          <img
            src="images/avatar.png"
            alt={translate("userAvatar")}
            style={{
              width: "3.2rem",
              height: "3.2rem",
              borderRadius: "50%",
              overflow: "hidden",
              background: "grey",
              marginRight: "8px",
              marginTop: "6px"
            }}
          />
          <div>
            <span>
              {translate("description", {
                username: gameRequest.challenger,
                rating: gameRequest.challenger_rating
              })}
            </span>
            <div style={{ color: "#8C8C8C" }}>
              {translate("details", {
                time: `${gameRequest.challenger_time} ${gameRequest.challenger_inc_or_delay}`,
                ratingType: gameRequest.rating_type,
                isRated: gameRequest.rated ? "rated" : "non-rated",
                color: gameRequest.challenger_color_request
              })}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={onDeclineGame}
            style={{
              border: "0px",
              color: "#E39335",
              fontWeight: 500,
              fontSize: "14px",
              textTransform: "uppercase"
            }}
          >
            {translate("decline")}
          </Button>
          <Button
            onClick={onAcceptGame}
            style={{
              border: "0px",
              color: "#1565C0",
              fontWeight: 500,
              fontSize: "14px",
              textTransform: "uppercase"
            }}
          >
            {translate("accept")}
          </Button>
        </div>
      </div>
    );
  };

  const renderTitle = () => (
    <div style={{ fontWeight: 500, fontSize: "16px", color: "#5b6785" }}>
      {translate("dialogTitle")}
    </div>
  );

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
