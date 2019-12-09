import React, { Component } from "react";
import RightBarTabs from "./RightBarToptabs";
import RightBarActiveTabs from "./RightBarTopActivetabs";

import RightBarBottom from "./RightBarBottom";

import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightSidebar");

class RightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: props.gameStatus
    };
  }
/*   componentWillReceiveProps(prevProps) {
    if (prevProps.gameStatus !== this.props.gameStatus) {
    //  alert(prevProps.gameStatus);
      this.setState({ status: this.props.gameStatus });
    }
  } */
  render() {
    let tabitem = null;
    if (this.props.gameStatus === "playing") {
      tabitem = (
        <RightBarActiveTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          performAction={this.props.performAction}
          actionData={this.props.actionData}
          ref="right_bar_top"
        />
      );
    } else {
      tabitem = (
        <RightBarTabs
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
        <div style={this.props.cssmanager.rightTopContent()}>{tabitem}</div>
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
