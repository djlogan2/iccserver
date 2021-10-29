import { Button } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { GameRequestCollection, mongoCss } from "../../../../../../imports/api/client/collections";
import { translate } from "../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";

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
  withDynamicStyles("css.playWithFriendCss"),
  translate("Play.PlayWithFriend")
)(PlayWithFriend);
