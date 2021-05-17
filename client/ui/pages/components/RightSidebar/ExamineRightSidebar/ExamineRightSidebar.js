import React, { Component } from "react";
import { compose } from "redux";

import ExamineSidebarTop from "../elements/ExamineSidebarTop";
import ExamineRightSidebarBottom from "../elements/ExamineRightSidebarBottom";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

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
      classes,
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
      <div className={classes.main}>
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

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(ExamineRightSidebar);
