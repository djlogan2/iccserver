import React, { Component } from "react";
import KibitzChatApp from "../../Chat/KibitzChatApp";
import FenPgn from "./FenPgn";
import { Tabs } from "antd";
import { translate } from "../../../../HOCs/translate";

const { TabPane } = Tabs;

class ExamineRightSidebarBottom extends Component {
  render() {
    const { game, onPgnUpload, translate, onImportedGames } = this.props;

    return (
      <Tabs className="examine-right-sidebar-bottom" defaultActiveKey="1" size="small" type="card">
        <TabPane tab={translate("tabs.chat")} key="chat">
          <KibitzChatApp isKibitz={true} gameId={game._id} />
        </TabPane>
        <TabPane tab={translate("tabs.fenPgn")} key="fen-png">
          <FenPgn game={game} onPgnUpload={onPgnUpload} onImportedGames={onImportedGames} />
        </TabPane>
        <TabPane tab={translate("tabs.games")} key="games">
          <div className="examine-sidebar-game">{translate("workInProgress")}</div>
        </TabPane>
      </Tabs>
    );
  }
}

export default translate("Examine.ExamineRightSidebarBottom")(ExamineRightSidebarBottom);
