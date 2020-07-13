import React, { Component, Fragment } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";

import { Chat } from "../../../../api/collections";

const KibitzChatApp = ({ gameId, chats, ...rest }) => {
  const handleMessage = text => {
    Meteor.call("kibitz", "kibitz", gameId, rest.isKibitz, text, (err, response) => {
      if (err) {
      }
    });
  };
  return <ChatApp chats={chats} onMessage={handleMessage} {...rest} />;
};

export default withTracker(props => {
  return {
    chats: Chat.find({ id: props.gameId }).fetch()
  };
})(KibitzChatApp);
