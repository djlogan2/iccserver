import React from "react";
import { Button } from "antd";
import { translate } from "../../../HOCs/translate";

const CommunityRightBlock = translate("Common.Community")(
  ({ activeRoom, roomList, onChange, onClose, translate }) => {
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
  }
);

export default CommunityRightBlock;
