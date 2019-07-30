/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";

export default class GameShareComponent extends Component {
  render() {
    
    return (
      <div>
        <span style={this.props.CssManager.gameShareIcon()} />
      </div>
    );
  }
}
