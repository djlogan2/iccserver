import React, { Component } from "react";
import ChatApp from "./ChatApp";
import FenPgn from "./FenPgn";
import { Tabs } from "antd";
const { TabPane } = Tabs;

export default class ExamineRightSidebarBottom extends Component {
  constructor(props) {
    super();
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    return (
      <Tabs className="examine-right-sidebar-bottom" defaultActiveKey="1" size="small" type="card">
        <TabPane tab={"Chat"} key="chat">
          <ChatApp gameId={this.props.gameId} />
        </TabPane>
        <TabPane tab="FEN/PGN" key="fen-png">
          <FenPgn fen={this.props.fen} moveList={this.props.moveList} />
        </TabPane>
        <TabPane tab="GAMES" key="games">
          Content of tab 2
        </TabPane>
      </Tabs>
    );
  }
}
