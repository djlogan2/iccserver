import React, { Component, useState } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import AppWrapper from "../pages/components/AppWrapper";

import Messenger from "./components/Chat/Messenger";
import Chess from "chess.js";
import { Link } from "react-router-dom";
import { Tracker } from "meteor/tracker";
import { Button, Input, Modal, Popconfirm, message } from "antd";
import {
  ClientMessagesCollection,
  Game,
  Chat,
  Rooms,
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/Community");

const MessengerWithData = withTracker(props => {
  return {
    messageList: Chat.find({
      type: "room",
      id: props.roomData._id
    }).fetch(),
  };
})(Messenger);

const RoomBlock = ({ activeRoom, list, onChange, onAdd }) => {
  const [roomName, setRoomName] = useState("");
  const [isModal, setModal] = useState(0);

  const onOpen = () => {
    setModal(true);
  };
  const onCancel = () => {
    setRoomName("");
    setModal(false);
  };
  const onOk = () => {
    setRoomName("");
    setModal(false);
    onAdd(roomName);
  };
  return (
    <div className="room-block">
      <div className="room-block__head">
        <h2 className="room-block__title">Rooms</h2>
        <Modal title="Create Room" visible={isModal} onOk={onOk} onCancel={onCancel}>
          <Input value={roomName} onChange={e => setRoomName(e.target.value)} />
        </Modal>
        <Button onClick={onOpen} className="room-block__add">
          Add
        </Button>
      </div>

      <ul className="room-block__list">
        {list.map(item => {
          let itemClasses =
            activeRoom === item._id
              ? "room-block__list-item room-block__list-item--active"
              : "room-block__list-item";
          return (
            <li
              onClick={() => {
                onChange(item._id);
              }}
              key={item._id}
              className={itemClasses}
            >
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

class Community extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRoom: null,
      inputValue: "",
      messageList: [],

      chat: Meteor.subscribe("chat"),
      rooms: Meteor.subscribe("rooms")
    };
  }

  componentWillUnmount() {
    this.state.chat && this.state.chat.stop();
    this.state.rooms && this.state.rooms.stop();
  }

  componentDidUpdate = prevProps => {
    if (prevProps.rooms.length === 0 && this.props.rooms.length > 0) {
      this.setState({ activeRoom: this.props.rooms[0]._id });
    }
  };

  handleAdd = roomName => {
    // createRoom
    console.log(this.props.rooms);
    Meteor.call("createRoom", "createRoom", roomName, true, (error, data) => {
      if (error) {
        // add
        debugger;
      }
    });
  };

  handleChangeRoom = roomId => {
    this.setState({ activeRoom: roomId });
  };

  handleChange = e => {
    this.setState({
      inputValue: e.target.value
    });
  };

  handleMessage = roomId => {
    let newMessage = { text: this.state.inputValue, name: "you" };
    let isKibitz = this.props.isKibitz === true ? true : false;
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });

    Meteor.call("writeToRoom", "writeToRoom", roomId, newMessage.text, (err, response) => {
      if (err) {
        debugger;
      }
    });
  };

  renderMessenger = () => {
    let roomList = this.props.rooms;
    let activeRoom = this.state.activeRoom;
    if (roomList.length === 0 || activeRoom === null) {
      return null;
    }
    let roomData = roomList.find(item => item._id === activeRoom);
    return (
      <MessengerWithData
        roomData={roomData}
        inputValue={this.state.inputValue}
        // messageList={this.props.chatList}
        onChange={this.handleChange}
        onMessage={this.handleMessage}
      />
    );
  };

  render() {
    return (
      <AppWrapper>
        <div className="community__sidebar">
          <RoomBlock
            activeRoom={this.state.activeRoom}
            list={this.props.rooms}
            onAdd={this.handleAdd}
            onChange={this.handleChangeRoom}
          />
        </div>
        <div className="community__messenger">{this.renderMessenger()}</div>
      </AppWrapper>
    );
    // return <div className="examine">Community</div>;
  }
}

export default withTracker(props => {
  return {
    rooms: Rooms.find().fetch(),
    // chatList: Chat.find({
    //   type: "room",
    //   id:
    // }).fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Community);
