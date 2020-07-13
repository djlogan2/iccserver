import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Observers from "./ObserversComponent";
import RoomChat from "./RoomChatComponent";

import "./Tabs/BottomStyles";
import i18n from "meteor/universe:i18n";

class RightBarBottomActiveTabs extends Component {
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
    let translator = i18n.createTranslator("Common.rightBarBottom", this.getLang());

    return (
      <Tabs  cssManager={this.props. cssManager} tabName="bottom">
        <div
          label={translator("chat")}
          imgsrc="images/chat-icon-white.png"
          hoverSrc="images/chat-icon-blue.png"
          default="false"
        >
          <Chat
             cssManager={this.props. cssManager}
            gameRequest={this.props.gameRequest}
            clientMessage={this.props.clientMessage}
          />
        </div>
        <div
          label="Observers"
          imgsrc="images/observers.png"
          hoverSrc="images/observers-active.png"
          default="false"
        >
          <Observers
             cssManager={this.props. cssManager}
            examing={this.props.examing}
            clientMessage={this.props.clientMessage}
          />
        </div>
        <div
          label="Room Chat"
          imgsrc="images/room-chat.png"
          hoverSrc="images/room-chat-active.png"
          default="roomchat"
        >
          <RoomChat  cssManager={this.props. cssManager} clientMessage={this.props.clientMessage} />
        </div>
      </Tabs>
    );
  }
}
export default RightBarBottomActiveTabs;
