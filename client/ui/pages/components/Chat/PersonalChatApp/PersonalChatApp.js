import React, { Component } from "react";
import ChatApp from "../ChatApp/ChatApp";
import { withTracker } from "meteor/react-meteor-data";
import { Chat, ChildChatTexts } from "../../../../../../imports/api/client/collections";
import { Logger } from "../../../../../../lib/client/Logger";

const log = new Logger("client/PersonalChatApp_js");

class PersonalChatApp extends Component {
  constructor(props) {
    log.trace("PersonalChatApp constructor", props);
    super(props);
  }

  handleChat(text) {
    const { opponentId } = this.props;

    if (text) {
      Meteor.call("writeToUser", "writeToUser", opponentId, text);
    }
  }

  render() {
    const { childChatTexts, disabled, opponent, chats } = this.props;

    const cc1 = (Meteor.user()?.cf || "") + (opponent?.cf || "");

    const childChat = cc1.indexOf("c") !== -1 && cc1.indexOf("e") === -1;

    return (
      <ChatApp
        chats={chats}
        disabled={disabled}
        user={Meteor.user()}
        childChat={childChat}
        childChatTexts={childChatTexts}
        onMessage={(text) => this.handleChat(text)}
      />
    );
  }
}

export default withTracker((props) => {
  return {
    opponent: Meteor.users.findOne({ _id: props.opponentId }),
    childChatTexts: ChildChatTexts.find().fetch(),
    chats: Chat.find({
      type: "private",
      $or: [{ id: props.opponentId }, { "issuer.id": props.opponentId }],
    }).fetch(),
  };
})(PersonalChatApp);
