import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { translate } from "../../../HOCs/translate";

const RoomBlock = translate("Common.Community")(
  ({ activeRoom, list, onChange, onAdd, openRightBlock, translate }) => {
    const [roomName, setRoomName] = useState("");
    const [isModal, setModal] = useState(false);

    const handleCancel = () => {
      setRoomName("");
      setModal(false);
    };

    const handleOk = () => {
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
            onOk={handleOk}
            onCancel={handleCancel}
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
  }
);

export default RoomBlock;
