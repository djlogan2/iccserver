import React, { Component } from "react";
import { Button } from "antd";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import classNames from "classnames";

class CommunityRightBlock extends Component {
  render() {
    const {
      activeRoom,
      roomList,
      onChange,
      onClose,
      translate,
      handleOpenModal,
      classes,
    } = this.props;
    return (
      <>
        <div className={classes.roomBlock}>
          <div className={classes.roomBlockHead}>
            <h2 className={classes.roomBlockTitle}>
              {translate("CommunityRightBlock.allRooms", { rooms: roomList.length })}
            </h2>
            <Button onClick={onClose}>{translate("CommunityRightBlock.close")}</Button>
          </div>
          <ul className={classes.roomBlockList}>
            {roomList.map((item) => {
              const isActive = activeRoom === item._id;
              return (
                <li
                  onClick={() => {
                    onChange(item._id);
                  }}
                  key={item._id}
                  className={classNames(
                    classes.roomBlockListItem,
                    isActive && classes.roomBlockListItemActive
                  )}
                >
                  {item.name}
                </li>
              );
            })}
          </ul>
        </div>
        <div className={classes.roomBlockCreateButton}>
          <Button type="primary" onClick={handleOpenModal} block>
            {translate("CommunityRightBlock.createRoom")}
          </Button>
        </div>
      </>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Community")
)(CommunityRightBlock);
