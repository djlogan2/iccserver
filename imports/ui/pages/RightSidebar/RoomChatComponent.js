import React, { Component } from "react";
import { chatLabelStyle, chatRooms } from "../../../constants/RoomChatConstants";

export default class RoomChatComponent extends Component {
  render() {
    const { cssManager } = this.props;

    const content = chatRooms.map((room, index) => (
      <button key={index} style={cssManager.matchUserButton()}>
        <label style={chatLabelStyle}>{room.roomId}</label>
        <label style={chatLabelStyle}>{room.Users}</label>
      </button>
    ));
    return (
      <div>
        <div style={cssManager.subTabHeader()}>{content}</div>
      </div>
    );
  }
}
