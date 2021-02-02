import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";

import { Chat, ChildChatTexts } from "../../../../api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/PersonalChatApp_js");

class KibitzChatApp extends Component {
  handleMessage(text) {
    const { gameId, isKibitz } = this.props;

    if (text) {
      Meteor.call("kibitz", "kibitz", gameId, isKibitz, text, err => {
        if (err) {
          log.error(err);
        }
      });
    }
  }

  render() {
    const { childChatTexts, chats, disabled } = this.props;

    return (
      <ChatApp
        disabled={disabled}
        childChat={Meteor.user().cf === "c"}
        childChatTexts={childChatTexts}
        user={Meteor.user()}
        chats={chats}
        onMessage={text => this.handleMessage(text)}
      />
    );
  }
}

export default withTracker(props => {
  return {
    chats: Chat.find({ id: props.gameId }).fetch(),
    childChatTexts: ChildChatTexts.find().fetch()
  };
})(KibitzChatApp);
