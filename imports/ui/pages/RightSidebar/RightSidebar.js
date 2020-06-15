import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarTopActivetabs from "./RightBarTopActivetabs";
import RightBarBottom from "./RightBarBottom";
import RightBarBottomActiveTabs from "./RightBarBottomActiveTabs";
import RightBarBottomPostGameTabs from "./RightBarBottomPostGameTabs";

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

  componentWillReceiveProps(nextProps) {
    if (!!this.props.gameRequest) {
      if (nextProps.gameRequest !== this.props.gameRequest) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
    }
  }

  renderTopRigthSidebar = () => {
    let topTabitem = null;
    // let bottomTabitem = null;
    if (
      (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") &&
      this.props.newOppenetRequest === false
    ) {
      topTabitem = (
        <RightBarTopActivetabs
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
    return topTabitem;
  };

  renderBottomRightSidebar = () => {
    let bottomTabitem = null;
    if (this.props.gameStatus === "examining" && this.props.currentGame === true) {
      bottomTabitem = (
        <RightBarBottom
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
        <RightBarBottomPostGameTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          examing={this.props.examing}
        />
      );
    } else {
      bottomTabitem = (
        <RightBarBottomActiveTabs
          cssmanager={this.props.cssmanager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          examing={this.props.examing}
        />
      );
    }
    return bottomTabitem;
  };

  render() {
    return (
      <div className="right-content-desktop">
        <div style={this.props.cssmanager.rightTopContent()}>{this.renderTopRigthSidebar()}</div>
        <div style={this.props.cssmanager.rightBottomContent()}>
          {this.renderBottomRightSidebar()}
        </div>
      </div>
    );
  }
}
export default RightSidebar;
