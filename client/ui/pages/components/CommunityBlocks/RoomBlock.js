import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { translate } from "../../../HOCs/translate";
import { KEY_ENTER } from "../../../../constants/systemConstants";

const RoomBlock = translate("Community")(
  ({ activeRoom, list, onChange, onAdd, openRightBlock, translate, isModal, handleCloseModal }) => {
    const [roomName, setRoomName] = useState("");
    const [isPrivate] = useState(true);

    const handleCancel = () => {
      setRoomName("");
      handleCloseModal();
    };

    const handleOk = () => {
      setRoomName("");
      handleCloseModal();

      onAdd(roomName, isPrivate);
    };

    const handleKeyDown = (itemId) => (event) => {
      if (event.key === KEY_ENTER) {
        onChange(itemId);
      }
    };

    return (
      <div className="room-block">
        <div className="room-block__head">
          <h2 className="room-block__title">
            {translate("RoomBlock.rooms", { rooms: list.length })}
          </h2>
          <Modal
            title={translate("RoomBlock.title")}
            visible={!!isModal}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          </Modal>
          <Button
            onClick={openRightBlock}
            title={translate("RoomBlock.plusTitle")}
            className="room-block__plus"
          >
            {translate("RoomBlock.plus")}
          </Button>
        </div>

        <ul className="room-block__list">
          {list.map((item) => {
            let itemClasses =
              activeRoom === item._id
                ? "room-block__list-item room-block__list-item--active"
                : "room-block__list-item";
            return (
              <li
                role="button"
                tabIndex="0"
                title={translate("RoomBlock.joinRoom", { roomName: item.name })}
                onClick={() => {
                  onChange(item._id);
                }}
                key={item._id}
                className={itemClasses}
                onKeyDown={handleKeyDown(item._id)}
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

export default RoomBlock;
