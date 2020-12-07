import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import SeekGame from "./SeekGameComponent";
import QuickPairing from "./QuickPairingGameComponent";
import MatchUser from "./MatchUserComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";

export default class RightBarToptabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "others"
    };
  }

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
    let translator = i18n.createTranslator("Common.rightBarTop", this.getLang());

    return (
      <Tabs cssManager={this.props.cssManager}>
        <div label={translator("quikpairing")}>
          <QuickPairing cssManager={this.props.cssManager} />
        </div>

        <div label={translator("seekgame")}>
          <SeekGame cssManager={this.props.cssManager} />
        </div>

        <div label={translator("matchuser")}>
          <MatchUser cssManager={this.props.cssManager} gameRequest={this.props.gameRequest} />
        </div>
      </Tabs>
    );
  }
}
