import React, { Component } from "react";

export default class Players extends Component {
  render() {
    return (
      <div style={this.props.CssManager.tagLine()}>
        <a href="#/" target="_blank" style={this.props.CssManager.userName()}>
          {this.props.playerInfo} ({this.props.rating})
        </a>
        <i style={this.props.CssManager.flags(this.props.flags)} />
      </div>
    );
  }
}
