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
    let tabitem = null;
    if (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") {
      tabitem = (
        <RightBarActiveTabs
          RightBarTopData={this.props.RightSidebarData}
          cssmanager={this.props.cssmanager}
          flip={this.props.flip}
          actionData={this.props.actionData}
          gameRequest={this.state.gameRequest}
          examineAction={this.props.examineAction}
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
