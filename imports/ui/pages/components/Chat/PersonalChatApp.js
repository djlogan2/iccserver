import React, { Component } from "react";
import ChatApp from "./ChatApp";
import { withTracker } from "meteor/react-meteor-data";
import { Chat, ChildChatTexts, ChildChatUsers } from "../../../../api/client/collections";
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
    const child_chat =
      !this.props.child_chat_user.some(ccu => ccu.type === 1) &&
      this.props.child_chat_user.some(ccu => ccu.type === 0);
    return (
      <ChatApp
        child_chat={child_chat}
        child_chat_texts={this.props.child_chat_texts}
        chats={this.props.chats}
        onMessage={text => this.handleChat(text)}
      />
    );
  }
}

export default withTracker(props => {
  return {
    child_chat_user: ChildChatUsers.find({
      userid: { $in: [Meteor.userId(), props.opponentId] }
    }).fetch(),
    child_chat_texts: ChildChatTexts.find().fetch(),
    chats: Chat.find({
      type: "private",
      $or: [{ id: props.opponentId }, { "issuer.id": props.opponentId }]
    }).fetch()
  };
})(PersonalChatApp);
