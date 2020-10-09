import React, { Component } from "react";
import i18n from "meteor/universe:i18n";

export default class RoomChatComponent extends Component {
  constructor(props) {
    super(props);

    this.chatRooms = [
      {
        roomId: "Room1",
        Users: "10 Users"
      },
      {
        roomId: "Room2",
        Users: "10 Users"
      },
      {
        roomId: "Room3",
        Users: "10 Users"
      },
      {
        roomId: "Room4",
        Users: "10 Users"
      },
      {
        roomId: "Room5",
        Users: "10 Users"
      }
    ];
  }
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    let content = [];
    this.chatRooms.forEach((room, index) => {
      content.push(
        <button key={index} style={this.props. cssManager.matchUserButton()}>
          <label
            style={{
              fontWeight: "300",
              paddingRight: "10px",
              paddingLeft: "5px",
              verticalAlign: "top"
            }}
          >
            {room.roomId}
          </label>
          <label
            style={{
              fontWeight: "300",
              paddingRight: "10px",
              paddingLeft: "5px",
              verticalAlign: "top"
            }}
          >
            {room.Users}
          </label>
        </button>
      );
    });
    return (
      <div>
        <div style={this.props. cssManager.subTabHeader()}>{content}</div>
      </div>
    );
  }
}
