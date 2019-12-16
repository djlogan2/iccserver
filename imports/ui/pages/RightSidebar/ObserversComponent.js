import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

export default class ObserversComponent extends Component {
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <p style={{ padingLeft: "15px" }}>Now we have working on</p>
      </div>
    );
  }
}
