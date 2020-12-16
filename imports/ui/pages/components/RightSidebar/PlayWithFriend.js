import React from "react";
import { Button } from "antd";
import { translate } from "../../../HOCs/translate";

const PlayWithFriend = ({ onClose, onChoose, usersToPlayWith, translate }) => (
  <div className="play-friend">
    <div className="play-friend__head">
      <h2 className="play-friend__name-title">{translate("PLAY_WITH_FRIEND")}</h2>
      <Button onClick={onClose}>{translate("BACK")}</Button>
    </div>
    <h3 className="play-friend__header">{translate("FRIENDS")}</h3>
    <ul className="play-friend__list">
      {usersToPlayWith.map(userItem => {
        return (
          <li key={userItem.username} className="play-friend__list-item">
            {userItem.username}
            <Button
              onClick={() => {
                onChoose(userItem._id);
              }}
            >
              {translate("CHOOSE")}
            </Button>
          </li>
        );
      })}
    </ul>
  </div>
);

export default translate("Play.PlayWithFriend")(PlayWithFriend);
