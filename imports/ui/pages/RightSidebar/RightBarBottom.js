import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Events from "./EventsComponent";
import PGN from "./PGNComponent";
import Friends from "./FriendsComponent";
import History from "./HistoryComponent";
import "./Tabs/BottomStyles";
class RightBarBottom extends Component {
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    let translator = i18n.createTranslator(
      "Common.rightBarBottom",
      this.getLang()
    );
    return (
      <Tabs cssmanager={this.props.cssmanager} tabName="bottom">
        <div
          label={translator("chat")}
          imgsrc="images/chat-icon-white.png"
          hoverSrc="images/chat-icon-blue.png"
        >
          <Chat
            cssmanager={this.props.cssmanager}
            gameRequest={this.props.gameRequest}
          />
        </div>
        {/* 
        <div
          label={translator("events")}
          imgsrc="images/event-icon-white.png"
          hoverSrc="images/event-icon-blue.png"
        >
          <Events />
        </div> */}
        <div
          label={translator("fen_pgn")}
          imgsrc="images/fen-pgn-white-icon.png"
          hoverSrc="images/fen-pgn-blue-icon.png"
        >
          <PGN />
        </div>
        <div
          label={translator("friends")}
          imgsrc="images/friend-icon-white.png"
          hoverSrc="images/friend-icon-blue.png"
        >
          <Friends />
        </div>
        <div
          label={translator("history")}
          imgsrc="images/history-icon-white.png"
          hoverSrc="images/history-icon-blue.png"
        >
          <History />
        </div>
      </Tabs>
    );
  }
}
export default RightBarBottom;
