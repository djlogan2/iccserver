import React, { Component } from "react";
import ExamineSidebarTop from "./elements/ExamineSidebarTop";
import ExamineRightSidebarBottom from "./elements/ExamineRightSidebarBottom";

class ExamineRightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameRequest: props.gameRequest,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { gameRequest } = this.props;

    if (!!gameRequest && nextProps.gameRequest !== gameRequest) {
      this.setState({ gameRequest });
    }
  }

  render() {
    const {
      game,
      allUsers,
      observeUser,
      unObserveUser,
      moveList,
      cssManager,
      flip,
      onPgnUpload,
      onImportedGames,
    } = this.props;
    const { gameRequest } = this.state;

    return (
      <div className="examine-right-sidebar">
        <ExamineSidebarTop
          game={game}
          allUsers={allUsers}
          observeUser={observeUser}
          unObserveUser={unObserveUser}
          moveList={moveList}
          cssManager={cssManager}
          flip={flip}
          gameRequest={gameRequest}
        />
        <ExamineRightSidebarBottom
          game={game}
          onPgnUpload={onPgnUpload}
          onImportedGames={onImportedGames}
        />
      </div>
    );
  }
}

export default ExamineRightSidebar;
