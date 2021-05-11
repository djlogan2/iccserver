import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import AppWrapper from "../components/AppWrapper/AppWrapper";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { Logger } from "../../../../lib/client/Logger";

import MessengerWithData from "../components/Chat/Messenger";
import { mongoCss, Rooms } from "../../../api/client/collections";
import RoomBlock from "../components/CommunityBlocks/RoomBlock";
import CommunityRightBlock from "../components/CommunityBlocks/CommunityRightBlock";
import { areArraysOfObectsEqual, isReadySubscriptions } from "../../../utils/utils";
import Loading from "../components/Loading";
import { RESOURCE_HOME } from "../../../constants/resourceConstants";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import classNames from "classnames";

const log = new Logger("client/Community_js");

class Community extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRoom: null,
      inputValue: "",
      messageList: [],
      isRightMenu: false,
      isModal: false,
    };
  }

  componentDidUpdate = (prevProps) => {
    const { allRooms } = this.props;

    if (allRooms && allRooms.length && !areArraysOfObectsEqual(prevProps.allRooms, allRooms)) {
      this.setState({ activeRoom: allRooms[0]._id });
    }
  };

  handleAdd = (roomName, isPrivate) => {
    Meteor.call("createRoom", "createRoom", roomName, isPrivate, (error) => {
      if (error) {
        log.error(error);
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

  handleChangeRoom = (roomId) => {
    const { activeRoom } = this.state;

    if (activeRoom) {
      Meteor.call("leaveRoom", "leaveRoom", activeRoom);
    }

    Meteor.call("joinRoom", "joinRoom", roomId);
    this.setState({ activeRoom: roomId });
  };

  handleChange = (inputValue) => {
    this.setState({ inputValue });
  };

  handleMessage = (roomId) => {
    const { inputValue, messageList } = this.state;
    const newMessage = { text: inputValue, name: "you" };

    this.setState({
      inputValue: "",
      messageList: [...messageList, newMessage],
    });

    if (newMessage.text) {
      Meteor.call("writeToRoom", "writeToRoom", roomId, newMessage.text, (err) => {
        if (err) {
          log.error(err);
        }
      });
    }
  };

  renderMessenger = () => {
    const { allRooms: roomList } = this.props;
    const { activeRoom, inputValue } = this.state;

    if (!roomList.length || !activeRoom) {
      return;
    }

    const roomData = roomList.find((item) => item._id === activeRoom);

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
    const { allRooms, notMyRooms, isReady, history, classes } = this.props;
    const { isRightMenu, activeRoom, isModal } = this.state;

    const cf = Meteor.user().cf;

    if (cf && cf.indexOf("c") !== -1 && cf.indexOf("e") === -1) {
      history.push(RESOURCE_HOME);
    }

    if (!isReady) {
      return <Loading isPure={true} />;
    }

    return (
      <AppWrapper>
        <div className={classes.sidebar}>
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
        <div
          className={classNames(classes.messenger, !!isRightMenu && classes.messengerWithRightMenu)}
        >
          {this.renderMessenger()}
        </div>
        {!!isRightMenu && (
          <div className={classes.rightBlock}>
            <CommunityRightBlock
              activeRoom={activeRoom}
              roomList={notMyRooms}
              handleOpenModal={this.handleOpenModal}
              onAdd={this.handleAdd}
              onClose={this.handleCloseRightBlock}
              onChange={this.handleChangeRoom}
            />
          </div>
        )}
      </AppWrapper>
    );
  }
}

export default compose(
  withRouter,
  withTracker(() => {
    const subscriptions = {
      chat: Meteor.subscribe("chat"),
    };

    return {
      isReady: isReadySubscriptions(subscriptions),
      css: mongoCss.findOne(),
      allRooms: Rooms.find().fetch(),
      notMyRooms: Rooms.find({ "members.id": { $not: Meteor.userId() } }).fetch(),
    };
  }),
  injectSheet(dynamicStyles)
)(Community);
