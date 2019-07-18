import React, { Component } from "react";

export default class Players extends Component {
  constructor(props) {
    super(props);

  }
  render() {
    return (
      <div className="user-tagline-component">
        <a href="#" target="_blank" className="user-tagline-username">{this.props.playerInfo} ({this.props.rating})</a>
        <i><img src="../../../../../images/user-flag.png" alt="" /></i>
      </div>
    );
  }
}
