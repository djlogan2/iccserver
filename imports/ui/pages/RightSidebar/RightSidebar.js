import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarTopActivetabs from "./RightBarTopActivetabs";
import RightBarBottom from "./RightBarBottom";
import RightBarBottomActiveTabs from "./RightBarBottomActiveTabs";

class RightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameRequest: props.gameRequest,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { gameRequest } = this.props;

    if (!!gameRequest) {
      if (nextProps.gameRequest !== gameRequest) {
        this.setState({ gameRequest });
      }
    }
  }

  renderTopRigthSidebar = () => {
    const {
      gameStatus,
      newOppenetRequest,
      RightSidebarData,
      cssManager,
      flip,
      startGameExamine,
      examineAction,
      gameRequest,
    } = this.props;
    const { gameRequest: stateGameRequest } = this.state;

    if ((gameStatus === "playing" || gameStatus === "examining") && !newOppenetRequest) {
      return (
        <RightBarTopActivetabs
          RightBarTopData={RightSidebarData}
          cssManager={cssManager}
          flip={flip}
          gameRequest={stateGameRequest}
          startGameExamine={startGameExamine}
          examineAction={examineAction}
          ref="right_bar_top"
        />
      );
    } else {
      return (
        <RightBarTabs
          cssManager={cssManager}
          gameRequest={gameRequest}
          flip={flip}
          ref="right_bar_top"
        />
      );
    }
  };

  renderBottomRightSidebar = () => {
    const {
      gameStatus,
      cssManager,
      gameRequest,
      clientMessage,
      game,
      activeTabnumber,
      RightSidebarData,
      uploadPgn,
    } = this.props;

    switch (gameStatus) {
      case "examining":
        return (
          <RightBarBottom
            cssManager={cssManager}
            gameRequest={gameRequest}
            clientMessage={clientMessage}
            activeTabnumber={activeTabnumber}
            Gamedata={RightSidebarData}
            uploadPgn={uploadPgn}
          />
        );
      default:
        return (
          <RightBarBottomActiveTabs
            cssManager={cssManager}
            gameRequest={gameRequest}
            clientMessage={clientMessage}
            game={game}
          />
        );
    }
  };

  render() {
    const { cssManager } = this.props;

    return (
      <div className="right-content-desktop">
        <div style={cssManager.rightTopContent()}>{this.renderTopRigthSidebar()}</div>
        <div style={cssManager.rightBottomContent()}>{this.renderBottomRightSidebar()}</div>
      </div>
    );
  }
}

export default RightSidebar;
