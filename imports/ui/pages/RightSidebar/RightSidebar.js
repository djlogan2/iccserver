import React, { Component } from "react";
import RightBarTop from "./RightbarTop";
import RightBarBottom from "./RightbarBottom";
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
        <div style={this.props.CssManager.settingIcon()}>
          <button onClick={this.handleFullScreenMode}>
            <img src="images/full-screen-icon.png" alt="" />
          </button>
        </div>

        <div style={this.props.CssManager.rightTopContent()}>
          <RightBarTop CssManager={this.props.CssManager} />
        </div>
        <div style={this.props.CssManager.rightBottomContent()}>
          <RightBarBottom CssManager={this.props.CssManager} />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
