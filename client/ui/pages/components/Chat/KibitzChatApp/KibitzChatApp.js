import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import ChatApp from "../ChatApp/ChatApp";
import { withTracker } from "meteor/react-meteor-data";
import { compose } from "redux";
import { withSounds } from "../../../../HOCs/withSounds";
import { Chat, ChildChatTexts } from "../../../../../../imports/api/client/collections";
import { Logger } from "../../../../../../lib/client/Logger";
import { isEqual } from "lodash";

const log = new Logger("client/PersonalChatApp_js");

class KibitzChatApp extends Component {
  handleMessage(text) {
    const { gameId, isKibitz } = this.props;

    if (text) {
      Meteor.call("kibitz", "kibitz", gameId, isKibitz, text, (err) => {
        if (err) {
          log.error(err);
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { chats, playSound } = this.props;
    if (prevProps.chats && chats && !isEqual(prevProps.chats, chats)) {
      playSound("sound");
    }
  }

  render() {
    const { childChatTexts, chats, disabled } = this.props;

    return (
      <>
        <ChatApp
          disabled={disabled}
          childChat={Meteor.user()?.cf === "c"}
          childChatTexts={childChatTexts}
          user={Meteor.user()}
          chats={chats}
          onMessage={(text) => this.handleMessage(text)}
        />
      </>
    );
  }
}

export default compose(
  withTracker((props) => {
    return {
      chats: Chat.find({ id: props.gameId }).fetch(),
      childChatTexts: ChildChatTexts.find().fetch(),
    };
  }),
  withSounds("KibitzChatApp")
)(KibitzChatApp);
