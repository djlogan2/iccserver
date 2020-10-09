import React, { Component } from "react";
import ChatInput from "./ChatInput";
import ChildChatInput from "./ChildChatInput";
import MessageItem from "./MessageItem";

export default class ChatApp extends Component {
  constructor() {
    super();
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
    let newMessage = { text: this.state.inputValue, name: "you" };
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });

    this.props.onMessage(newMessage.text);
  };

  render() {
    return (
      <div className="chat-app">
        <div className="chat-app__list-wrap">
          <div className="chat-app__message-list">
            {this.props.chats.map((chatItem, i) => (
              <MessageItem
                key={`message-${i}`}
                name={chatItem.issuer.username}
                text={chatItem.what}
              />
            ))}
          </div>
        </div>
        <div className="chat-app__input-bar">
          {this.props.child_chat && (
            <ChildChatInput
              child_chat_texts={this.props.child_chat_texts}
              selected={this.state.inputValue}
              onChange={this.handleChange}
              onMessage={this.handleMessage}
            />
          )}
          {!this.props.child_chat && (
            <ChatInput
              value={this.state.inputValue}
              onChange={this.handleChange}
              onMessage={this.handleMessage}
            />
          )}
        </div>
      </div>
    );
  }
}
