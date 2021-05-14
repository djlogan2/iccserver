import React from "react";
import ChatInput from "./ChatInput";
import MessageItem from "./MessageItem";
import { withTracker } from "meteor/react-meteor-data";
import { Chat } from "../../../../../imports/api/client/collections";

const Messenger = ({ roomData, inputValue, messageList, onChange, onMessage }) => {
  const handleMessage = () => {
    onMessage(roomData._id);
  };

  return (
    <div className="messenger">
      <div className="messenger__head">
        <h3 className="messenger__name">{roomData.name}</h3>
      </div>
      <div className="messenger__list-wrap">
        <div className="messenger__message-list">
          {messageList.map((chatItem, i) => (
            <MessageItem
              key={`message-${i}`}
              name={chatItem.issuer.username}
              text={chatItem.what}
            />
          ))}
        </div>
      </div>
      <div className="chat-app__input-bar">
        <ChatInput value={inputValue} onChange={onChange} onMessage={handleMessage} />
      </div>
    </div>
  );
};

const MessengerWithData = withTracker((props) => {
  return {
    messageList: Chat.find({
      type: "room",
      id: props.roomData._id,
    }).fetch(),
  };
})(Messenger);

export default MessengerWithData;
