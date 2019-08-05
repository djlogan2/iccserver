import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Events from "./EventsComponent";
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
      <Tabs CssManager={this.props.CssManager}>
        <div label={translator("chat")} imgsrc="images/chat-icon-blue.png">
          <Chat CssManager={this.props.CssManager} />
        </div>
        <div label={translator("events")} imgsrc="images/event-icon-blue.png">
          <Events />
        </div>
        <div
          label={translator("friends")}
          imgsrc="images/friend-icon-white.png"
        >
          <Friends />
        </div>
        <div
          label={translator("history")}
          imgsrc="images/history-icon-white.png"
        >
          <History />
        </div>
      </Tabs>
    );
  }
}
export default RightBarBottom;
