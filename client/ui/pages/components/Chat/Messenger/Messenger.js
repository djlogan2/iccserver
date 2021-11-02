import { withTracker } from "meteor/react-meteor-data";
import React, { useEffect, useRef, useState } from "react";
import { compose } from "redux";
import { Chat, mongoCss } from "../../../../../../imports/api/client/collections";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";
import { withSounds } from "../../../../HOCs/withSounds";
import ChatInput from "../ChatInput/ChatInput";
import MessageItem from "../MessageItem/MessageItem";

const Messenger = ({ roomData, messageList, onChange, onMessage, classes, playSound }) => {
  const [inputValue, changeInputValue] = useState("");

  const handleMessage = () => {
    changeInputValue("");
    onMessage(roomData._id, inputValue);
  };

  const hasMount = useRef(false);

  useEffect(() => {
    if (hasMount.current) {
      playSound("sound");
    } else {
      hasMount.current = true;
    }
  }, [messageList]);

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <h3 className={classes.name}>{roomData.name}</h3>
      </div>
      <div className={classes.listWrap}>
        <div className={classes.messageList}>
          {messageList.map((chatItem, i) => (
            <MessageItem
              key={`message-${i}`}
              name={chatItem.issuer.username}
              text={chatItem.what}
            />
          ))}
        </div>
      </div>
      <div className={classes.inputBar}>
        <ChatInput value={inputValue} onChange={changeInputValue} onMessage={handleMessage} />
      </div>
    </div>
  );
};

const MessengerWithData = compose(
  withTracker((props) => {
    return {
      messageList: Chat.find({
        type: "room",
        id: props.roomData._id,
      }).fetch(),
      css: mongoCss.findOne(),
    };
  }),
  withSounds("Messenger"),
  withDynamicStyles("css.messengerCss")
)(Messenger);

export default MessengerWithData;
