import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Events from "./EventsComponent";
import Friends from "./FriendsComponent";
import History from "./HistoryComponent";
import "./Tabs/BottomStyles";

const RightBarBottom = () => (
  <Tabs>
    <div label="Chat" imgsrc="images/chat-icon-blue.png" className="chat">
      <Chat />
    </div>
    <div label="Events" imgsrc="images/event-icon-blue.png" className="play">
      <Events />
    </div>
    <div
      label="Friends"
      imgsrc="images/friend-icon-white.png"
      className="tournament"
    >
      <Friends />
    </div>
    <div
      label="History"
      imgsrc="images/history-icon-white.png"
      className="tournament"
    >
      <History />
    </div>
  </Tabs>
);
export default RightBarBottom;
