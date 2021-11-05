import { Button } from "antd";
import classNames from "classnames";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

class CommunityRightBlock extends Component {
  render() {
    const { activeRoom, roomList, onChange, onClose, translate, handleOpenModal, classes } =
      this.props;
    return (
      <>
        <div className={classes.roomBlock}>
          <div className={classes.roomBlockHead}>
            <h2 className={classes.roomBlockTitle}>
              {translate("CommunityRightBlock.allRooms", { rooms: roomList.length })}
            </h2>
            <Button id="close-right-block" onClick={onClose}>
              {translate("CommunityRightBlock.close")}
            </Button>
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
          <Button id="create-room" type="primary" onClick={handleOpenModal} block>
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
  withDynamicStyles("css.playModalCss"),
  translate("Community")
)(CommunityRightBlock);
