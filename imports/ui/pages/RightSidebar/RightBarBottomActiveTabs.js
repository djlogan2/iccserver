import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Observers from "./ObserversComponent";
import RoomChat from "./RoomChatComponent";
import { translate } from "../../HOCs/translate";

import "./Tabs/BottomStyles";

class RightBarBottomActiveTabs extends Component {
  render() {
    const { translate, clientMessage, cssManager, gameRequest, game } = this.props;

    return (
      <Tabs cssManager={cssManager} tabName="bottom">
        <div
          label={translate("chat")}
          imgsrc="images/chat-icon-white.png"
          hoverSrc="images/chat-icon-blue.png"
          default="false"
        >
          <Chat cssManager={cssManager} gameRequest={gameRequest} clientMessage={clientMessage} />
        </div>
        <div
          label="Observers"
          imgsrc="images/observers.png"
          hoverSrc="images/observers-active.png"
          default="false"
        >
          <Observers game={game} />
        </div>
        <div
          label="Room Chat"
          imgsrc="images/room-chat.png"
          hoverSrc="images/room-chat-active.png"
          default="roomchat"
        >
          <RoomChat cssManager={cssManager} />
        </div>
      </Tabs>
    );
  }
}

export default translate("Common.rightBarBottom")(RightBarBottomActiveTabs);
