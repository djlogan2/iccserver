import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarActiveTabs from "./RightBarTopActivetabs";
import BottomExamineTabs from "./RightBarBottom";
import BottomActiveTabs from "./RightBarBottomActiveTabs";
import BottomPostGameTabs from "./RightBarBottomPostGameTabs";

import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightSidebar");

class RightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      gameRequest: props.gameRequest
    };
  }
  changeMode() {
    this.setState({ status: !this.state.status });
  }
  componentWillReceiveProps(nextProps) {
    if (!!this.props.gameRequest) {
      if (nextProps.gameRequest !== this.props.gameRequest) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
    }
  }
  
  render() {
    let topTabitem = null;
    let bottomTabitem = null;
    if (
      (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") &&
      this.props.newOppenetRequest === false
    ) {
      topTabitem = (
        <RightBarActiveTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          gameRequest={this.state.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
          currentGame={this.props.currentGame}
          ref="right_bar_top"
        />
      );
    } else {
      topTabitem = (
        <RightBarTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          flip={this.props.flip}
          ref="right_bar_top"
        />
      );
    }

    if (this.props.gameStatus === "examining" && this.props.currentGame === true) {
      bottomTabitem = (
        <BottomExamineTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          examing={this.props.examing}
          activeTabnumber={this.props.activeTabnumber}
          Gamedata={this.props.RightSidebarData}
          uploadPgn={this.props.uploadPgn}
        />
      );
    } else if (this.props.gameStatus === "examining" && this.props.currentGame === false) {
      bottomTabitem = (
        <BottomPostGameTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          examing={this.props.examing}
        />
      );
    } else {
      bottomTabitem = (
        <BottomActiveTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          examing={this.props.examing}
        />
      );
    }

    return (
      <div className="right-content-desktop">
        <div style={this.props.cssmanager.rightTopContent()}>{topTabitem}</div>
        <div style={this.props.cssmanager.rightBottomContent()}>{bottomTabitem}</div>
      </div>
    );
  }
}
export default RightSidebar;
