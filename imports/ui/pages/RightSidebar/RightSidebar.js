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
      status: true
    };
  }
  changeMode() {
    this.setState({ status: !this.state.status });
  }

  render() {
    let tabitem = null;

    if (
      (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") &&
      this.state.status === true
    ) {
      tabitem = (
        <RightBarActiveTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          actionData={this.props.actionData}
          ref="right_bar_top"
        />
      );
    } else {
      tabitem = (
        <RightBarTabs
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          ref="right_bar_top"
        />
      );
    }
    return (
      <div className="right-content-desktop">
        <div style={this.props.cssmanager.rightTopContent()}>{tabitem}</div>
        <button onClick={this.changeMode.bind(this)}>Change Menu</button>
        <div style={this.props.cssmanager.rightBottomContent()}>
          <RightBarBottom
            cssmanager={this.props.cssmanager}
            gameRequest={this.props.gameRequest}
            clientMessage={this.props.clientMessage}
            examing={this.props.examing}
          />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
