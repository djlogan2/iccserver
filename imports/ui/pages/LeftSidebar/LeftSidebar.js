import React, { Component } from "react";
import MenuLinks from "./MenuLinks";

class LeftSidebar extends Component {
  render() {
    return (
      <MenuLinks
        cssmanager={this.props.cssmanager}
        links={this.props.LefSideBoarData.MenuLinks}
        history={this.props.history}
      />
    );
  }
}
export default LeftSidebar;
