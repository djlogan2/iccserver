import React, { Component } from "react";
import RightBarTop from "./RightBarTop";
import RightBarBottom from "./RightBarBottom";

import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightSidebar");

class RightSidebar extends Component {
  render() {
    return (
      <div className="right-content-desktop">
        <div style={this.props.cssmanager.rightTopContent()}>
          <RightBarTop
            RightBarTopData={this.props.RightSidebarData}
            cssmanager={this.props.cssmanager}
            flip={this.props.flip}
            performAction={this.props.performAction}
            actionData={this.props.actionData}
            ref="right_bar_top"
          />
        </div>
        <div style={this.props.cssmanager.rightBottomContent()}>
          <RightBarBottom
            cssmanager={this.props.cssmanager}
            gameRequest={this.props.gameRequest}
            clientMessage={this.props.clientMessage}
          />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
