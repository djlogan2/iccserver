import React, { Component } from "react";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";
import { Chat, ChildChatTexts } from "../../../../api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/PersonalChatApp_js");

class PersonalChatApp extends Component {
  constructor(props) {
    log.trace("PersonalChatApp constructor", props);
    super(props);
  }

  handleChat(text) {
    Meteor.call("writeToUser", "writeToUser", this.props.opponentId, text);
  }

  render() {
    log.trace("PersonalChatApp render", this.props);
    const cc1 = (this.props.user.cf || "") + (this.props.opponent.cf || "");

    const child_chat = cc1.indexOf("c") !== -1 && cc1.indexOf("e") === -1;

    return (
      <ChatApp
        child_chat={child_chat}
        child_chat_texts={this.props.child_chat_texts}
        user={this.props.user}
        chats={this.props.chats}
        onMessage={text => this.handleChat(text)}
      />
    );
  }
}

export default withTracker(props => {
  return {
    opponent: Meteor.users.findOne({ _id: props.opponentId }),
    child_chat_texts: ChildChatTexts.find().fetch(),
    user: Meteor.users.findOne({ _id: Meteor.userId() }),
    chats: Chat.find({
      type: "private",
      $or: [{ id: props.opponentId }, { "issuer.id": props.opponentId }]
    }).fetch()
  };
})(PersonalChatApp);
