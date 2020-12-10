import React from "react";
import ChatInput from "./ChatInput";
import MessageItem from "./MessageItem";

export default ({ roomData, inputValue, messageList, onChange, onMessage }) => {
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
              // name={chatItem.name}
              // text={chatItem.text}
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
