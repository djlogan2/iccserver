import React, { Component } from "react";
import RightBarTop from "./RightBarTop";
import RightBarBottom from "./RightBarBottom";
import CssManager from "../components/Css/CssManager";
const css = new CssManager("developmentcss");
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
        <div style={css.settingIcon()}>
          <button onClick={this.handleFullScreenMode}>
            <img src="images/full-screen-icon.png" alt="" />
          </button>
        </div>

        <div style={css.rightTopContent()}>
          <RightBarTop
            CssManager={css}
            RightBarTopData={this.props.RightSidebarData}
          />
        </div>
        <div style={css.rightBottomContent()}>
          <RightBarBottom CssManager={css} />
        </div>
      </div>
    );
  }
}
export default RightSidebar;
