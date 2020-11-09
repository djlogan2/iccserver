import React, { Component, useState } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import AppWrapper from "../pages/components/AppWrapper";

import Messenger from "./components/Chat/Messenger";
import { Button, Input, Modal } from "antd";
import { Chat, Rooms, mongoCss } from "../../api/client/collections";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/Community");

const MessengerWithData = withTracker(props => {
  return {
    messageList: Chat.find({
      type: "room",
      id: props.roomData._id
    }).fetch()
  };
})(Messenger);

const RoomBlock = ({ activeRoom, list, onChange, onAdd, openRightBlock }) => {
  const [roomName, setRoomName] = useState("");
  const [isModal, setModal] = useState(0);

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
        {/* <Button onClick={onOpen} className="room-block__add">
          Add
        </Button> */}
        <Button onClick={openRightBlock} className="room-block__plus">
          +
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

const CommunityRightBlock = ({ activeRoom, roomList, onChange, onClose }) => {
  return (
    <div className="room-block">
      <div className="room-block__head">
        <h2 className="room-block__title">All rooms ({roomList.length})</h2>
        <Button onClick={onClose} className="room-block__add">
          Close
        </Button>
      </div>

      <ul className="room-block__list">
        {roomList.map(item => {
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
      isRightMenu: false
    };
  }

  componentWillUnmount() {
    this.state.chat && this.state.chat.stop();
    this.state.rooms && this.state.rooms.stop();
    this.state.game && this.state.game.stop();
    this.state.gameHistory && this.state.gameHistory.stop();
    this.state.importedGame && this.state.importedGame.stop();
  }

  componentDidUpdate = prevProps => {
    if (prevProps.allRooms.length === 0 && this.props.allRooms.length > 0) {
      this.setState({ activeRoom: this.props.allRooms[0]._id });
    }
  };

  handleAdd = roomName => {
    // createRoom
    Meteor.call("createRoom", "createRoom", roomName, true, error => {
      if (error) {
        // add
        debugger;
      }
    });
  };

  handleOpenRightBlock = () => {
    this.setState({ isRightMenu: true });
  };

  handleCloseRightBlock = () => {
    this.setState({ isRightMenu: false });
  };

  handleChangeRoom = roomId => {
    if (this.state.activeRoom) Meteor.call("leaveRoom", "leaveRoom", this.state.activeRoom);
    Meteor.call("joinRoom", "joinRoom", roomId);
    this.setState({ activeRoom: roomId });
  };

  handleChange = text => {
    this.setState({
      inputValue: text
    });
  };

  handleMessage = roomId => {
    let newMessage = { text: this.state.inputValue, name: "you" };
    this.setState({
      inputValue: "",
      messageList: [...this.state.messageList, newMessage]
    });

    Meteor.call("writeToRoom", "writeToRoom", roomId, newMessage.text, err => {
      if (err) {
        debugger;
      }
    });
  };

  renderMessenger = () => {
    let roomList = this.props.allRooms;
    let activeRoom = this.state.activeRoom;
    if (roomList.length === 0 || activeRoom === null) {
      return null;
    }
    let roomData = roomList.find(item => item._id === activeRoom);
    return (
      <MessengerWithData
        roomData={roomData}
        inputValue={this.state.inputValue}
        onChange={this.handleChange}
        onMessage={this.handleMessage}
      />
    );
  };

  render() {
    const rightBlockWidth = this.state.isRightMenu ? "214px" : 0;

    return (
      <AppWrapper>
        <div className="community__sidebar">
          <RoomBlock
            activeRoom={this.state.activeRoom}
            list={this.props.allRooms}
            onAdd={this.handleAdd}
            openRightBlock={this.handleOpenRightBlock}
            onChange={this.handleChangeRoom}
          />
        </div>
        <div className="community__messenger">{this.renderMessenger()}</div>
        <div className="community__right-block" style={{ maxWidth: rightBlockWidth }}>
          <CommunityRightBlock
            activeRoom={this.state.activeRoom}
            roomList={this.props.notMyRooms}
            onAdd={this.handleAdd}
            onClose={this.handleCloseRightBlock}
            onChange={this.handleChangeRoom}
          />
        </div>
      </AppWrapper>
    );
    // return <div className="examine">Community</div>;
  }
}

export default withTracker(() => {
  const subscriptions = {
    chat: Meteor.subscribe("chat")
  };

  function isready() {
    for (const k in subscriptions) if (!subscriptions[k].ready()) return false;
    return true;
  }

  return {
    isready: isready(),
    allRooms: Rooms.find().fetch(),
    notMyRooms: Rooms.find({ "members.id": { $not: Meteor.userId() } }).fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Community);
