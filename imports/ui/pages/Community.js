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
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/Community");

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
            activeRoom === item
              ? "room-block__list-item room-block__list-item--active"
              : "room-block__list-item";
          return (
            <li
              onClick={() => {
                onChange(item);
              }}
              key={item}
              className={itemClasses}
            >
              {item}
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
      activeRoom: "politics",
      inputValue: "",
      messageList: [],

      chats: Meteor.subscribe("chat"),
      room: Meteor.subscribe("room")
    };
  }

  componentWillUnmount() {
    this.state.chats && this.state.chats.stop();
    this.state.room && this.state.room.stop();
  }

  handleAdd = roomName => {
    Meteor.call("createRoom", "createRoom", roomName, error => {
      if (error) {
        // add
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
    //       debugger;
    //     }
    //   }
    // );
  };

  render() {
    return (
      <AppWrapper>
        <div className="community__sidebar">
          <RoomBlock
            activeRoom={this.state.activeRoom}
            list={["politics", "sport"]}
            onAdd={this.handleAdd}
            onChange={this.handleChangeRoom}
          />
        </div>
        <div className="community__messenger">
          <Messenger
            chatName={this.state.activeRoom}
            inputValue={this.state.inputValue}
            messageList={this.state.messageList}
            onChange={this.handleChange}
            onMessage={this.handleMessage}
          />
        </div>
      </AppWrapper>
    );
    // return <div className="examine">Community</div>;
  }
}

export default withTracker(props => {
  return {
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Community);
