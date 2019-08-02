import React, { Component } from "react";
import MenuLinks from "./MenuLinks";

class LeftSidebar extends Component {
  render() {
    return (
      <MenuLinks
        links={this.props.LeftProp.MenuLinks}
        CssManager={this.props.CssManager}
      />
    );
  }
}
export default LeftSidebar;