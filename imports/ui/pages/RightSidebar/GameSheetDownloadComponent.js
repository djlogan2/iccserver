import React, { Component } from "react";
export default class GameSheetDownloadComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.gameShareIcon()}>
        <img src="images/download-icon-gray.png" alt="" />
      </button>
    );
  }
}
