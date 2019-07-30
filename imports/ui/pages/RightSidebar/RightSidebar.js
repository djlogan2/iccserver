/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import RightBarTop from "./RightbarTop";
import RightBarBottom from "./RightbarBottom";
import CssManager from "../components/Css/CssManager";

const css = new CssManager("developmentcss");
class RightSidebar extends Component {
  constructor(props) {
    super(props);
    this.handleFullScreenMode = this.handleFullScreenMode.bind(this);
  }
  handleFullScreenMode = () => {
    console.log("add class to open fullscreen mode");
  };
  render() {
    return (
      <div>
        <div className="right-content-desktop">
          <div style={css.settingIcon()}>
            <button>
              <img
                src="images/full-screen-icon.png"
                alt="my image"
                onClick={this.handleFullScreenMode}
              />
            </button>
          </div>
          <div style={css.rightTopContent()}>
            <RightBarTop CssManager={css} />
          </div>
          <div style={css.rightBottomContent()}>
            <RightBarBottom CssManager={css} />
          </div>
        </div>
      </div>
    );
  }
}
export default RightSidebar;
