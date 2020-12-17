import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import AppWrapper from "../pages/components/AppWrapper";

import MessengerWithData from "./components/Chat/Messenger";
import { Rooms, mongoCss } from "../../api/client/collections";
import RoomBlock from "./components/CommunityBlocks/RoomBlock";
import CommunityRightBlock from "./components/CommunityBlocks/CommunityRightBlock";
import { areArraysOfObectsEqual, isReadySubscriptions } from "../../utils/utils";

class Community extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRoom: null,
      inputValue: "",
      messageList: [],
      isRightMenu: false,
      isModal: false
    };
  }

  componentDidUpdate = prevProps => {
    const { allRooms } = this.props;

    if (!areArraysOfObectsEqual(prevProps.allRooms, allRooms)) {
      this.setState({ activeRoom: allRooms[0]._id });
    }
  };

  handleAdd = (roomName, isPrivate) => {
    Meteor.call("createRoom", "createRoom", roomName, isPrivate, error => {
      if (error) {
        console.log(error);
      }
    });
  };

  handleOpenModal = () => {
    this.setState({ isModal: true });
  };

  handleCloseModal = () => {
    this.setState({ isModal: false });
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

  handleChange = inputValue => {
    this.setState({ inputValue });
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
    const { allRooms, notMyRooms } = this.props;
    const { isRightMenu, activeRoom, isModal } = this.state;

    const rightBlockWidth = isRightMenu ? "214px" : 0;

    return (
      <AppWrapper>
        <div className="community__sidebar">
          <RoomBlock
            isModal={isModal}
            activeRoom={activeRoom}
            list={allRooms}
            onAdd={this.handleAdd}
            handleCloseModal={this.handleCloseModal}
            openRightBlock={this.handleOpenRightBlock}
            onChange={this.handleChangeRoom}
          />
        </div>
        <div className="community__messenger">{this.renderMessenger()}</div>
        <div className="community__right-block" style={{ maxWidth: rightBlockWidth }}>
          <CommunityRightBlock
            activeRoom={activeRoom}
            roomList={notMyRooms}
            handleOpenModal={this.handleOpenModal}
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

  return {
    isready: isReadySubscriptions(subscriptions),
    allRooms: Rooms.find().fetch(),
    notMyRooms: Rooms.find({ "members.id": { $not: Meteor.userId() } }).fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Community);

export default CommunityWithTracker;
