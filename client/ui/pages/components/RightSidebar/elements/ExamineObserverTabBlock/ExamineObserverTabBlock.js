import { Button } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import { translate } from "../../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../../HOCs/withDynamicStyles";

const ExamineObserverTabBlock = ({ game, unObserveUser, translate, classes }) => {
  const ownerData = game.observers.find((item) => item.id === game.owner) || {};

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <div className={classes.name}>
          <img src="/images/avatar.png" alt={translate("userAvatar")} className={classes.nameImg} />
          <h2 className={classes.nameTitle}>{ownerData.username}</h2>
        </div>
        <span>
          {translate("observing", {
            quantity: game.observers.length,
            username: ownerData.username || translate("user"),
          })}
        </span>
      </div>
      <div>
        <Button
          onClick={() => {
            unObserveUser(Meteor.userId());
          }}
        >
          {translate("unobserve")}
        </Button>
      </div>
      <ul className={classes.list}>
        {game.observers.map((observerItem) => {
          if (game.owner === Meteor.userId()) {
            return (
              <li key={observerItem.username} className={classes.ownerListItem}>
                {observerItem.username}
              </li>
            );
          }
          return (
            <li key={observerItem.username} className={classes.observerListItem}>
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.examineObserverTabBlockCss"),
  translate("Examine.ExamineObserverTabBlock")
)(ExamineObserverTabBlock);
