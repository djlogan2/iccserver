import React, { Component } from "react";
import ExamineSidebarTop from "./elements/ExamineSidebarTop";
import ExamineRightSidebarBottom from "./elements/ExamineRightSidebarBottom";

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
        <ExamineRightSidebarBottom gameId={this.props.gameId}/>
      </div>
    );
  }
}
export default ExamineRightSidebar;
