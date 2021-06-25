import React from "react";
import { Button } from "antd";
import { compose } from "redux";
import { translate } from "../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { GameRequestCollection, mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import { Meteor } from "meteor/meteor";

const PlayWithFriend = ({
  classes,
  onClose,
  onChoose,
  onCancel,
  usersToPlayWith,
  translate,
  sentRequests,
}) => {
  const receiverIds = sentRequests.map((req) => req.receiver_id);

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <h2 className={classes.nameTitle}>{translate("PLAY_WITH_FRIEND")}</h2>
        <Button id="back-button" onClick={onClose}>
          {translate("BACK")}
        </Button>
      </div>
      <h3 className={classes.header}>{translate("FRIENDS")}</h3>
      <ul className={classes.list}>
        {usersToPlayWith.map((userItem) => (
          <li key={userItem.username} className={classes.listItem}>
            {userItem.username}
            {receiverIds.includes(userItem._id) ? (
              <Button
                onClick={() => {
                  onCancel(userItem._id);
                }}
              >
                {translate("CANCEL")}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onChoose(userItem._id);
                }}
              >
                {translate("CHOOSE")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
      usersToPlayWith: Meteor.users
        .find({ $and: [{ _id: { $ne: Meteor.userId() } }, { "status.game": { $ne: "playing" } }] })
        .fetch(),
      sentRequests: GameRequestCollection.find({ challenger_id: Meteor.userId() }).fetch(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Play.PlayWithFriend")
)(PlayWithFriend);
