import React, { Component } from "react";
import ChatInput from "./ChatInput";
import ChildChatInput from "./ChildChatInput";
import MessageItem from "./MessageItem";

export default class ChatApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: "",
      messageList: []
    };
  }

  handleChange = text => {
    this.setState({
      inputValue: text
    });
  };

  handleMessage = () => {
    const { onMessage } = this.props;
    const { inputValue, messageList } = this.state;

    const newMessage = { text: inputValue, name: "you" };

    this.setState({
      inputValue: "",
      messageList: [...messageList, newMessage]
    });

    onMessage(newMessage.text);
  };

  render() {
    const { chats, childChat, childChatTexts, disabled } = this.props;
    const { inputValue } = this.state;

    return (
      <div className="chat-app">
        <div className="chat-app__list-wrap">
          <div className="chat-app__message-list">
            {chats.map((chatItem, i) => (
              <MessageItem
                key={`message-${i}`}
                name={chatItem.issuer.username}
                text={chatItem.what}
              />
            ))}
          </div>
        </div>
        <div className="chat-app__input-bar">
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
