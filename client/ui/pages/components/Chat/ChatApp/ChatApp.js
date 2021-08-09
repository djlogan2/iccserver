import React, { Component } from "react";
import { compose } from "redux";

import ChatInput from "../ChatInput/ChatInput";
import ChildChatInput from "../ChildChatInput/ChildChatInput";
import MessageItem from "../MessageItem/MessageItem";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

class ChatApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: "",
      messageList: [],
    };
  }

  handleChange = (text) => {
    this.setState({
      inputValue: text,
    });
  };

  handleMessage = () => {
    const { onMessage } = this.props;
    const { inputValue, messageList } = this.state;

    const newMessage = { text: inputValue, name: "you" };

    this.setState({
      inputValue: "",
      messageList: [...messageList, newMessage],
    });

    onMessage(newMessage.text);
  };

  render() {
    const { chats, childChat, childChatTexts, disabled, classes } = this.props;
    const { inputValue } = this.state;

    return (
      <div className={classes.main}>
        <div className={classes.listWrap}>
          <div className={classes.messageList}>
            {chats &&
              chats.map((chatItem, i) => (
                <MessageItem
                  key={`message-${i}`}
                  name={chatItem?.issuer?.username}
                  text={chatItem?.what}
                />
              ))}
          </div>
        </div>
        <div className={classes.inputBar}>
          {childChat ? (
            <ChildChatInput
              disabled={disabled}
              childChatTexts={childChatTexts}
              selected={inputValue}
              onChange={this.handleChange}
              onMessage={this.handleMessage}
            />
          ) : (
            <ChatInput
              disabled={disabled}
              value={inputValue}
              onChange={this.handleChange}
              onMessage={this.handleMessage}
            />
          )}
        </div>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(ChatApp);
