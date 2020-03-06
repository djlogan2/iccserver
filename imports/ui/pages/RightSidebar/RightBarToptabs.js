import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import SeekGame from "./SeekGameComponent";
import QuickPairing from "./QuickPairingGameComponent";
import MatchUser from "./MatchUserComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightBarTop");

export default class RightBarToptabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "others"
    };
  }
  /*  componentWillReceiveProps(prevProps) {
    if (prevProps.RightBarTopData1.status !== this.props.RightBarTopData1.status) {
      if (this.props.RightBarTopData1.status === "playing") this.setState({ status: "playing" });
    }
  } */
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
      <Tabs cssmanager={this.props.cssmanager}>
        <div label={translator("quikpairing")}>
          <QuickPairing cssmanager={this.props.cssmanager} />
        </div>

        <div label={translator("seekgame")}>
          <SeekGame cssmanager={this.props.cssmanager} />
        </div>

        <div label={translator("matchuser")}>
          <MatchUser cssmanager={this.props.cssmanager} gameRequest={this.props.gameRequest} />
        </div>
      </Tabs>
    );
  }
}
