import React from "react";
import { Button } from "antd";
import { compose } from "redux";

import { translate } from "../../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import { Meteor } from "meteor/meteor";

const ExamineObserverTabBlock = ({ game, unObserveUser, translate, classes }) => {
  const ownerData = game.observers.find((item) => item.id === game.owner) || {};

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <div className={classes.name}>
          <img
            src={`mugshot/${Meteor.userId()}`}
            alt={translate("userAvatar")}
            className={classes.nameImg}
          />
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
  injectSheet(dynamicStyles),
  translate("Examine.ExamineObserverTabBlock")
)(ExamineObserverTabBlock);
