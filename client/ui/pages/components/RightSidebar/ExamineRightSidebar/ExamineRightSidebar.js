import React, { Component } from "react";
import { compose } from "redux";

import ExamineSidebarTop from "../elements/ExamineSidebarTop/ExamineSidebarTop";
import ExamineRightSidebarBottom from "../elements/ExamineRightSidebarBottom/ExamineRightSidebarBottom";
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
      <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "50%" }}>
          <ExamineSidebarTop
            game={game}
            observeUser={observeUser}
            unObserveUser={unObserveUser}
            moveList={moveList}
            cssManager={cssManager}
            flip={flip}
            gameRequest={gameRequest}
          />
        </div>
        <div style={{ height: "50%" }}>
          <ExamineRightSidebarBottom
            game={game}
            onPgnUpload={onPgnUpload}
            onImportedGames={onImportedGames}
          />
        </div>
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
