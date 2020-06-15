import React, { Component } from "react";
import { Input, Button } from "antd";
import { Meteor } from "meteor/meteor";

const MessageItem = ({ name, text }) => {
  return (
    <div className="message-item">
      <div className="message-item__name">You</div>
      <p className="message-item__text">{text}</p>
    </div>
  );
};

class ChatApp extends Component {
  constructor() {
    super();
    this.state = {
      inputValue: "",
      //   messageList: [{ name: "you", text: "Some text" }, { name: "you", text: "Some text" }]
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
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });
    // function(message_identifier, game_id, kibitz, txt)
    Meteor.call("kibitz", "kibitz", this.props.gameId, true, newMessage.text, (err, response) => {
      if (err) {
        debugger;
      }
    });
  };

  render() {
    return (
      <div className="chat-app">
        <div className="chat-app__message-list">
          {this.state.messageList.map((item, i) => (
            <MessageItem key={`message-${i}`} name={item.name} text={item.text} />
          ))}
        </div>
        <div className="chat-app__input-bar">
          <Input
            value={this.state.inputValue}
            onChange={this.handleChange}
            placeholder="Your message"
          />
          <Button onClick={this.handleMessage}>Send</Button>
        </div>
      </div>
    );
  }
}

export default ChatApp;
