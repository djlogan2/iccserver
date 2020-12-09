import React, { Component, useState } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import AppWrapper from "../pages/components/AppWrapper";

import Messenger from "./components/Chat/Messenger";
import { Button, Input, Modal } from "antd";
import { Chat, Rooms, mongoCss } from "../../api/client/collections";
import { translate } from "../HOCs/translate";

const MessengerWithData = withTracker(props => {
  return {
    messageList: Chat.find({
      type: "room",
      id: props.roomData._id
    }).fetch()
  };
})(Messenger);

const RoomBlock = ({ activeRoom, list, onChange, onAdd, openRightBlock, translate }) => {
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
        <h2 className="room-block__title">{translate("RoomBlock.rooms")}</h2>
        <Modal
          title={translate("RoomBlock.title")}
          visible={!!isModal}
          onOk={onOk}
          onCancel={onCancel}
        >
          <Input value={roomName} onChange={e => setRoomName(e.target.value)} />
        </Modal>
        <Button onClick={openRightBlock} className="room-block__plus">
          {translate("RoomBlock.plus")}
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

const CommunityRightBlock = ({ activeRoom, roomList, onChange, onClose, translate }) => {
  return (
    <div className="room-block">
      <div className="room-block__head">
        <h2 className="room-block__title">
          {translate("CommunityRightBlock.allRooms", { rooms: roomList.length })}
        </h2>
        <Button onClick={onClose} className="room-block__add">
          {translate("CommunityRightBlock.close")}
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

  componentDidUpdate = prevProps => {
    const { allRooms } = this.props;

    if (!prevProps.allRooms.length && allRooms.length) {
      this.setState({ activeRoom: allRooms[0]._id });
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
    const { activeRoom } = this.state;

    if (activeRoom) {
      Meteor.call("leaveRoom", "leaveRoom", activeRoom);
    }
    Meteor.call("joinRoom", "joinRoom", roomId);
    this.setState({ activeRoom: roomId });
  };

  handleChange = text => {
    this.setState({
      inputValue: text
    });
  };

  handleMessage = roomId => {
    const { inputValue, messageList } = this.state;
    const newMessage = { text: inputValue, name: "you" };

    this.setState({
      inputValue: "",
      messageList: [...messageList, newMessage]
    });

    Meteor.call("writeToRoom", "writeToRoom", roomId, newMessage.text, err => {
      if (err) {
        debugger;
      }
    });
  };

  renderMessenger = () => {
    const { allRooms: roomList } = this.props;
    const { activeRoom, inputValue } = this.state;

    if (!roomList.length || !activeRoom) {
      return;
    }

    const roomData = roomList.find(item => item._id === activeRoom);

    return (
      <MessengerWithData
        roomData={roomData}
        inputValue={inputValue}
        onChange={this.handleChange}
        onMessage={this.handleMessage}
      />
    );
  };

  render() {
    const { allRooms, notMyRooms, translate } = this.props;
    const { isRightMenu, activeRoom } = this.state;

    const rightBlockWidth = isRightMenu ? "214px" : 0;

    return (
      <AppWrapper>
        <div className="community__sidebar">
          <RoomBlock
            activeRoom={activeRoom}
            list={allRooms}
            translate={translate}
            onAdd={this.handleAdd}
            openRightBlock={this.handleOpenRightBlock}
            onChange={this.handleChangeRoom}
          />
        </div>
        <div className="community__messenger">{this.renderMessenger()}</div>
        <div className="community__right-block" style={{ maxWidth: rightBlockWidth }}>
          <CommunityRightBlock
            activeRoom={activeRoom}
            roomList={notMyRooms}
            translate={translate}
            onAdd={this.handleAdd}
            onClose={this.handleCloseRightBlock}
            onChange={this.handleChangeRoom}
          />
        </div>
      </AppWrapper>
    );
  }
}

const CommunityWithTracker = withTracker(() => {
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

export default translate("Common.Community")(CommunityWithTracker);
