import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

class ActionComponent extends Component {
  constructor(props) {
    super(props);
    this.username = "";
    this.gameId = "";
    this.userId = "";
    this.gameTurn = "";
    this.whitePlayer = "";
    this.blackPlayer = "";
  }
  static getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  _takeBackAction = () => {
    this.props.performAction("request", "takeBackRequest");
  };

  _drawAction = () => {
    this.props.performAction("request", "drawRequest");
  };
  _resignAction = () => {
    this.props.performAction("request", "resign");
  };
  _abortAction = () => {
    this.props.performAction("request", "abortRequest");
  };
  render() {
    this.userId = this.props.actionData.userId;
    this.username = this.props.actionData.user;
    this.gameId = this.props.actionData.gameId;
    this.gameTurn = this.props.actionData.gameTurn;
    this.whitePlayer = this.props.actionData.whitePlayer;
    this.blackPlayer = this.props.actionData.blackPlayer;
    let translator = i18n.createTranslator(
      "Common.actionButtonLabel",
      ActionComponent.getLang()
    );

    return (
      <div className="draw-section">
        <div style={this.props.cssmanager.drawActionSection()}>
          Current User : {this.username}
        </div>
        <ul>
          <li style={this.props.cssmanager.drawSectionList()}>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this._takeBackAction.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("takeBack")}
                alt="TakeBack"
                style={this.props.cssmanager.drawSectionButton()}
              />
              {translator("takeBack")}
            </button>
          </li>

          <li style={this.props.cssmanager.drawSectionList()}>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this._drawAction.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("draw")}
                alt="Draw"
                style={this.props.cssmanager.drawSectionButton()}
              />
              {translator("draw")}
            </button>
          </li>

          <li style={this.props.cssmanager.drawSectionList()}>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this._resignAction.bind(this, "request", "resign")}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("resign")}
                alt="Resign"
                style={this.props.cssmanager.drawSectionButton()}
              />
              {translator("resign")}
            </button>
          </li>

          <li style={this.props.cssmanager.drawSectionList()}>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this._abortAction.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("abort")}
                alt="Abort"
                style={this.props.cssmanager.drawSectionButton()}
              />

              {translator("abort")}
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
export default ActionComponent;
