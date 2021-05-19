import React from "react";
import { compose } from "redux";
import ChatInput from "../ChatInput/ChatInput";
import MessageItem from "../MessageItem/MessageItem";
import { withTracker } from "meteor/react-meteor-data";
import { Chat, mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const Messenger = ({ roomData, inputValue, messageList, onChange, onMessage, classes }) => {
  const handleMessage = () => {
    onMessage(roomData._id);
  };

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
        <ChatInput value={inputValue} onChange={onChange} onMessage={handleMessage} />
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
  injectSheet(dynamicStyles)
)(Messenger);

export default MessengerWithData;
