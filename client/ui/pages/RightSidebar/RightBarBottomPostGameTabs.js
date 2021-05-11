import React, { Component } from "react";
import { translate } from "../../HOCs/translate";
import Tabs from "./Tabs/Tabs";
import Chat from "./ChatComponent";
import Observers from "./ObserversComponent";

import "./Tabs/BottomStyles";

class RightBarBottomPostGameTabs extends Component {
  render() {
    const { translate, cssManager, gameRequest, clientMessage, game } = this.props;

    return (
      <Tabs cssManager={cssManager} tabName="bottom">
        <div
          label={translate("chat")}
          imgsrc="images/chat-icon-white.png"
          hoverSrc="images/chat-icon-blue.png"
        >
          <Chat cssManager={cssManager} gameRequest={gameRequest} clientMessage={clientMessage} />
        </div>
        <div
          label={translate("observers")}
          imgsrc="images/observers.png"
          hoverSrc="images/observers-active.png"
        >
          <Observers game={game} />
        </div>
      </Tabs>
    );
  }
}

export default translate("Common.rightBarBottom")(RightBarBottomPostGameTabs);
