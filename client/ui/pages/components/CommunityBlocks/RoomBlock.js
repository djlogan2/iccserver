import React, { Component } from "react";
import { Button, Input, Modal } from "antd";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import { KEY_ENTER } from "../../../../constants/systemConstants";
import injectSheet from "react-jss";
import { dynamicStyles } from "./roomBlockDynamicStyles";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import classNames from "classnames";

class RoomBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: "",
      iPrivate: true,
    };
  }

  handleCancel = () => {
    const { handleCloseModal } = this.props;

    handleCloseModal();
    this.setState({ roomName: "" });
  };

  handleOk = () => {
    const { onAdd, handleCloseModal } = this.props;
    const { roomName, isPrivate } = this.state;
    handleCloseModal();

    onAdd(roomName, isPrivate);

    this.setState({ roomName: "" });
  };

  handleKeyDown = (itemId) => (event) => {
    const { onChange } = this.props;

    if (event.key === KEY_ENTER) {
      onChange(itemId);
    }
  };

  render() {
    const { activeRoom, list, onChange, openRightBlock, translate, isModal, classes } = this.props;
    const { roomName } = this.state;

    return (
      <div className={classes.roomBlock}>
        <div className={classes.roomBlockHead}>
          <h2 className={classes.roomBlockTitle}>
            {translate("RoomBlock.rooms", { rooms: list.length })}
          </h2>
          <Modal
            id="room-create-modal"
            title={translate("RoomBlock.title")}
            visible={!!isModal}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => this.setState({ roomName: e.target.value })}
            />
          </Modal>
          <Button
            id="open-right-block"
            onClick={openRightBlock}
            title={translate("RoomBlock.plusTitle")}
            className={classes.roomBlockPlus}
          >
            {translate("RoomBlock.plus")}
          </Button>
        </div>

        <ul className={classes.roomBlockList}>
          {list.map((item) => {
            let isActive = activeRoom === item._id;
            return (
              <li
                role="button"
                tabIndex="0"
                title={translate("RoomBlock.joinRoom", { roomName: item.name })}
                onClick={() => {
                  onChange(item._id);
                }}
                id={item._id}
                key={item._id}
                className={classNames(
                  classes.roomBlockListItem,
                  isActive && classes.roomBlockListItemActive
                )}
                onKeyDown={this.handleKeyDown(item._id)}
              >
                {item.name}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  translate("Community"),
  injectSheet(dynamicStyles)
)(RoomBlock);
