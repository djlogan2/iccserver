import React, { Component, Fragment } from "react";
import { Input, Button } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import ChatInput from "./ChatInput";
import MessageItem from "./MessageItem";



export default class ChatApp extends Component {
  constructor() {
    super();
    this.state = {
      inputValue: "",
      messageList: []
    };
  }

  handleChange = e => {
    this.setState({
      inputValue: e.target.value
    });
  };

  handleMessage = () => {
    let newMessage = { text: this.state.inputValue, name: "you" };
    let isKibitz = this.props.isKibitz === true ? true : false;
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });
    // function(message_identifier, game_id, kibitz, txt)
    // Meteor.call(
    //   "kibitz",
    //   "kibitz",
    //   this.props.gameId,
    //   isKibitz,
    //   newMessage.text,
    //   (err, response) => {
    //     if (err) {

    //     }
    //   }
    // );

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
          <ChatInput
            value={this.state.inputValue}
            onChange={this.handleChange}
            onMessage={this.handleMessage}
          />
        </div>
      </div>
    );
  }
}
