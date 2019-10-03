import React, { Component } from "react";
import RightBarTop from "./RightBarTop";
import RightBarBottom from "./RightBarBottom";

import { Logger } from "../../../../lib/client/Logger";
import MiddleBoard from "../MiddleSection/MiddleBoard";

const log = new Logger("client/RightSidebar");

class RightSidebar extends Component {
  render() {
  //  log.debug("legacyMessage=" + this.props.legacymessages);
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
            legacyusers={this.props.legacyusers}
          />
        </div>
        <div style={this.props.cssmanager.rightBottomContent()}>
          <RightBarBottom cssmanager={this.props.cssmanager} />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
