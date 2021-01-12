import React from "react";
import { Button } from "antd";
import { translate } from "../../../../HOCs/translate";

const ExamineObserverTabBlock = ({ game, unObserveUser, translate }) => {
  const ownerData = game.observers.find(item => item.id === game.owner) || {};

  return (
    <div className="examine-observer-tab-block">
      <div className="examine-observer-tab-block__head">
        <div className="examine-observer-tab-block__name">
          <img
            src={"../../../images/avatar.png"}
            alt={translate("userAvatar")}
            className="examine-observer-tab-block__name-img"
          />
          <h2 className="examine-observer-tab-block__name-title">{ownerData.username}</h2>
        </div>
        <span className="examine-observer-tab-block__head-right">
          {translate("observing", {
            quantity: game.observers.length,
            username: ownerData.username || translate("user")
          })}
        </span>
      </div>
      <div className="examine-observer-tab-block__action-list">
        <Button
          onClick={() => {
            unObserveUser(Meteor.userId());
          }}
        >
          {translate("unobserve")}
        </Button>
      </div>
      <ul className="examine-observer-tab-block__list">
        {game.observers.map(observerItem => {
          if (game.owner === Meteor.userId()) {
            return (
              <li key={observerItem.username} className="examine-owner-tab-block__list-item">
                {observerItem.username}
              </li>
            );
          }
          return (
            <li key={observerItem.username} className="examine-observer-tab-block__list-item">
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default translate("Examine.ExamineObserverTabBlock")(ExamineObserverTabBlock);
