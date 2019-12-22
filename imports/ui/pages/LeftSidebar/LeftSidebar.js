import React, { Component } from "react";
import MenuLinks from "./MenuLinks";

class LeftSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }
  render() {
    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }
    return (
      <div className="col-sm-2 left-col">
        <div
          className={
            this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
          }
        >
          <div className="pull-left image">
            <img src={this.props.cssmanager.buttonBackgroundImage("logoWhite")} alt="logo" />
          </div>
          <button style={this.props.cssmanager.buttonStyle(buttonStyle)} onClick={this.toggleMenu}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("toggleMenu")}
              style={this.props.cssmanager.toggleMenuHeight()}
              alt="toggle menu"
            />
          </button>

          <MenuLinks
            cssmanager={this.props.cssmanager}
            links={this.props.LefSideBoarData.MenuLinks}
            history={this.props.history}
          />
        </div>
      </div>
    );
  }
}
export default LeftSidebar;
