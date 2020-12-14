import React, { Component } from "react";
import KibitzChatApp from "./../../Chat/KibitzChatApp";
import FenPgn from "./FenPgn";
import { Tabs } from "antd";
const { TabPane } = Tabs;

export default class ExamineRightSidebarBottom extends Component {
  render() {
    return (
      <Tabs className="examine-right-sidebar-bottom" defaultActiveKey="1" size="small" type="card">
        <TabPane tab={"Chat"} key="chat">
          <KibitzChatApp isKibitz={true} gameId={this.props.game._id} />
        </TabPane>
        <TabPane tab="FEN/PGN" key="fen-png">
          <FenPgn game={this.props.game} onPgnUpload={this.props.onPgnUpload} />
        </TabPane>
        <TabPane tab="Games" key="games">
          <div className="examine-sidebar-game">work in progress</div>
        </TabPane>
      </Tabs>
    );
  }
}
