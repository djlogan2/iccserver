import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarActiveTabs from "./RightBarTopActivetabs";

import RightBarBottom from "./RightBarBottom";

import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightSidebar");

class RightSidebar extends Component {
  /* componentWillReceiveProps(prevProps) {
    if (prevProps.RightSidebarData.status !== this.props.RightSidebarData.status) {
      
    }
  } */
  render() {
    let status = true;
    let tabitem1 = null;
    if (!!this.props.RightSidebarData.status && this.props.RightSidebarData.status === "playing")
      status = false;
    if (status) {
      tabitem1 = (
        <RightBarTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          performAction={this.props.performAction}
          actionData={this.props.actionData}
          ref="right_bar_top"
        />
      );
    } else {
      tabitem1 = (
        <RightBarActiveTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          performAction={this.props.performAction}
          actionData={this.props.actionData}
          ref="right_bar_top"
        />
      );
    }
    return (
      <div className="right-content-desktop">
        <div style={this.props.cssmanager.rightTopContent()}>{tabitem1}</div>
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
