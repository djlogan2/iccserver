import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";

import { Chat, ChildChatTexts } from "../../../../api/client/collections";

class KibitzChatApp extends Component {
  handleMessage(text) {
    Meteor.call("kibitz", "kibitz", this.props.gameId, this.props.isKibitz, text, err => {
      if (err) {
        console.error(err);
      }
    });
  }

  render() {
    const { childChatTexts, chats } = this.props;

    return (
      <ChatApp
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
