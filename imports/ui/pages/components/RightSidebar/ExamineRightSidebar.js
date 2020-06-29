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
          game={this.props.game}
          allUsers={this.props.allUsers}
          user={this.props.user}
          observeUser={this.props.observeUser}
          unObserveUser={this.props.unObserveUser}
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          gameRequest={this.state.gameRequest}
          currentGame={this.props.currentGame}
          ref="right_bar_top"
        />
        <ExamineRightSidebarBottom
          gameId={this.props.gameId}
          fen={this.props.game.fen}
          moveList={this.props.game.variations.movelist}
        />
      </div>
    );
  }
}
export default ExamineRightSidebar;
