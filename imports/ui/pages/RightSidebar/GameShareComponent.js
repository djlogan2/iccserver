import React, { Component } from "react";
export default class GameShareComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.gameShareIcon()}>
        <img src="images/share-icon-gray.png" alt="" />
      </button>
    );
  }
}
