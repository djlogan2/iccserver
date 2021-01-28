import React from "react";
import { Meteor } from "meteor/meteor";
import { notification, Button } from "antd";
import { get } from "lodash";

const GameRequestSeek = ({ gameRequest, translate }) => {
  const currentUser = Meteor.users.findOne({ _id: gameRequest.owner });

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
                username: currentUser.username,
                rating: get(currentUser, `ratings.${gameRequest.rating_type}.rating`, 0)
              })}
            </span>
            <div style={{ color: "#8C8C8C" }}>
              {translate("details", {
                time: `${gameRequest.time} ${gameRequest.inc_or_delay}`,
                ratingType: gameRequest.rating_type,
                isRated: gameRequest.rated ? "rated" : "non-rated",
                color: gameRequest.color
              })}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Button
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

  if (Meteor.userId() !== gameRequest.owner) {
    notification.open({
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
  }
};

export default GameRequestSeek;
