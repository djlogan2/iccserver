import React, { Component } from "react";
import RightBarTop from "./RightBarTop";
import RightBarBottom from "./RightBarBottom";

class RightSidebar extends Component {
  processRealtimeMessages(realtime_messages) {
    this.refs.right_bar_top.processRealtimeMessaages(realtime_messages);
  }

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
          <RightBarBottom cssmanager={this.props.cssmanager} />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
