import React, { Component } from "react";
import { Input, Button } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { Chat } from "../../../../../api/collections";

const MessageItem = ({ name, text }) => {
  return (
    <div className="message-item">
      <div className="message-item__name">{name}</div>
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
    let isKibitz = this.props.isKibitz === true ? true : false;
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });
    // function(message_identifier, game_id, kibitz, txt)
    Meteor.call(
      "kibitz",
      "kibitz",
      this.props.gameId,
      isKibitz,
      newMessage.text,
      (err, response) => {
        if (err) {
          debugger;
        }
      }
    );
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

// export default withTracker(props => {
//   return {
//     chats: Chat.find({"id": props.gameId})
//     // chats: Chat.find({ type: { $in: ["kibitz", "whisper"] } }).fetch()
//   })(ChatApp)
// export default ChatApp;

export default withTracker(props => {
  return {
    chats: Chat.find({ id: props.gameId }).fetch()
  };
})(ChatApp);
