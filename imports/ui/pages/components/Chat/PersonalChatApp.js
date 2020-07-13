import React, { Component, Fragment } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";

import { Chat } from "../../../../api/collections";

const PersonalChatApp = ({ opponentId, chats, ...rest }) => {
  const handleMessage = text => {
    Meteor.call("writeToUser", "writeToUser", opponentId, text, (err, response) => {
      if (err) {
        debugger;
      }
    });
  };
  return <ChatApp chats={chats} onMessage={handleMessage} {...rest} />;
};

export default withTracker(props => {
  return {
    chats: Chat.find({ $or: [{ id: props.opponentId }, { "issuer.id": props.opponentId }] }).fetch()
  };
})(PersonalChatApp);
