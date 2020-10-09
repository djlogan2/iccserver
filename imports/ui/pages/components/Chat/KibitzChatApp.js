import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";

import { Chat, ChildChatTexts } from "../../../../api/client/collections";

class KibitzChatApp extends Component {
  handleMessage(text) {
    Meteor.call("kibitz", "kibitz", this.props.gameId, this.props.isKibitz, text, err => {
      if (err) {
      }
    });
  }

  render() {
    return (
      <ChatApp
        child_chat={this.props.user.cf === "c"}
        child_chat_texts={this.props.child_chat_texts}
        user={this.props.user}
        chats={this.props.chats}
        onMessage={text => this.handleMessage(text)}
      />
    );
  }
}

export default withTracker(props => {
  return {
    chats: Chat.find({ id: props.gameId }).fetch(),
    child_chat_texts: ChildChatTexts.find().fetch(),
    user: Meteor.users.findOne({ _id: Meteor.userId() })
  };
})(KibitzChatApp);
