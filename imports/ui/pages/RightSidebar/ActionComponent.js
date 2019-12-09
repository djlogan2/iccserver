import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

class ActionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: "action"
    };
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
  handleChangeSecond = event => {
    let action = event.target.value;
    this.setState({ action: "action" });
    switch (action) {
      case "halfMove":
        this._takeBackAction(1);
        break;
      case "fullMove":
        this._takeBackAction(2);
        break;
      case "abort":
        this._abortAction();
        break;
      default:
    }
    //this.props.handleChangeSecond(parseInt(event.target.value));
  };
  _takeBackAction = number => {
    this.props.performAction("request", "takeBackRequest", number);
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
    let translator = i18n.createTranslator("Common.actionButtonLabel", ActionComponent.getLang());

    return (
      <div className="draw-section">
        <div style={this.props.cssmanager.drawActionSection()}>Current User : {this.username}</div>
        <ul>
          {/*     <li style={this.props.cssmanager.drawSectionList()}>
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
 */}
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
            <span style={this.props.cssmanager.spanStyle("form")}>
              <select
                onChange={this.handleChangeSecond}
                style={{ border: "none", outline: "none", padding: "9px 0px" }}
                value={this.state.action}
              >
                <option value="action">Action</option>
                <option value="abort">Abort</option>
                <option value="halfMove">TakeBack 1 Move</option>
                <option value="fullMove">TakeBack 2 Moves</option>
                <option value="flag">Flag</option>
                <option value="moretime">Moretime</option>
                <option value="adjourn">Adjourn</option>
              </select>
            </span>
          </li>

          {/* 
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
 */}
        </ul>
      </div>
    );
  }
}
export default ActionComponent;
