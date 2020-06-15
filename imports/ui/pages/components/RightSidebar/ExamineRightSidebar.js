import React, { Component } from "react";
import ExamineSidebarTop from "./elements/ExamineSidebarTop";
import { Tabs } from "antd";
const { TabPane } = Tabs;

const ChatApp = () => {
  return <div className="chat-app">chat app</div>;
};
class ExamineRightSidebarBottom extends Component {
  constructor(props) {
    super();
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    return (
      <Tabs
        className="examine-right-sidebar-bottom"
        defaultActiveKey="1"
        size="small"
        type="card"
        style={{ marginBottom: 32 }}
      >
        <TabPane tab={"Chat"} key="chat">
          <ChatApp />
        </TabPane>
        <TabPane tab="FEN/PGN" key="fen-png">
          Content of tab 2
        </TabPane>
        <TabPane tab="GAMES" key="games">
          Content of tab 2
        </TabPane>
      </Tabs>
    );
  }
}

class ExamineRightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      gameRequest: props.gameRequest
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.gameRequest) {
      if (nextProps.gameRequest !== this.props.gameRequest) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
    }
  }

  render() {
    return (
      <div className="examine-right-sidebar">
        <ExamineSidebarTop
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          gameRequest={this.state.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
          currentGame={this.props.currentGame}
          ref="right_bar_top"
        />
        <ExamineRightSidebarBottom />
      </div>
    );
  }
}
export default ExamineRightSidebar;
