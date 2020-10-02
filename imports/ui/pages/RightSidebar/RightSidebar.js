import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarTopActivetabs from "./RightBarTopActivetabs";
import RightBarBottom from "./RightBarBottom";
import RightBarBottomActiveTabs from "./RightBarBottomActiveTabs";
import RightBarBottomPostGameTabs from "./RightBarBottomPostGameTabs";

import { Logger } from "../../../../lib/client/Logger";

// eslint-disable-next-line no-unused-vars
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
    let topTabitem;
    if (
      (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") &&
      this.props.newOppenetRequest === false
    ) {
      topTabitem = (
        <RightBarTopActivetabs
          RightBarTopData={this.props.RightSidebarData}
          cssManager={this.props.cssManager}
          flip={this.props.flip}
          gameRequest={this.state.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
          ref="right_bar_top"
        />
      );
    } else {
      topTabitem = (
        <RightBarTabs
          cssManager={this.props.cssManager}
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
    if (this.props.gameStatus === "examining") {
      bottomTabitem = (
        <RightBarBottom
          cssManager={this.props.cssManager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          activeTabnumber={this.props.activeTabnumber}
          Gamedata={this.props.RightSidebarData}
          uploadPgn={this.props.uploadPgn}
        />
      );
    } else if (this.props.gameStatus === "examining") {
      bottomTabitem = (
        <RightBarBottomPostGameTabs
          cssManager={this.props.cssManager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          game={this.props.game}
        />
      );
    } else {
      bottomTabitem = (
        <RightBarBottomActiveTabs
          cssManager={this.props.cssManager}
          gameRequest={this.props.gameRequest}
          clientMessage={this.props.clientMessage}
          game={this.props.game}
        />
      );
    }
    return bottomTabitem;
  };

  render() {
    return (
      <div className="right-content-desktop">
        <div style={this.props.cssManager.rightTopContent()}>{this.renderTopRigthSidebar()}</div>
        <div style={this.props.cssManager.rightBottomContent()}>
          {this.renderBottomRightSidebar()}
        </div>
      </div>
    );
  }
}
export default RightSidebar;
