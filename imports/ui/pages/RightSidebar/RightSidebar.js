import React, { Component } from "react";
import RightBarTop from "./RightBarTop";
import RightBarBottom from "./RightBarBottom";
import CssManager from "../components/Css/CssManager";
class RightSidebar extends Component {
  constructor(props) {
    super(props);
    this.handleFullScreenMode = this.handleFullScreenMode.bind(this);
  }
  handleFullScreenMode = () => {
    /* console.log("add class to open fullscreen mode"); */
  };
  render() {
    return (
      <div className="right-content-desktop">
        <div style={CssManager.rightTopContent()}>
          <RightBarTop RightBarTopData={this.props.RightSidebarData} />
        </div>
        <div style={CssManager.rightBottomContent()}>
          <RightBarBottom />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
