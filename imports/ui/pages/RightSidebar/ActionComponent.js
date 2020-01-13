import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

class ActionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: "action"
    };
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
        this._abortRequest();
        break;
      default:
    }
  };
  _takeBackAction = number => {
    Meteor.call("requestTakeback", "takeBackRequest", this.gameId, number);
  };
  _drawRequest = () => {
    Meteor.call("requestToDraw", "drawRequest", this.gameId);
  };
  _abortRequest = () => {
    Meteor.call("requestToAbort", "abortRequest", this.gameId);
  };
  _adjournRequest = () => {
    Meteor.call("requestToAdjourn", "adjournRequest", this.gameId);
  };
  _resignGame = () => {
    Meteor.call("resignGame", "resignGame", this.gameId);
  };
  render() {
    this.userId = this.props.actionData.userId;
    this.gameId = this.props.actionData.gameId;
    let status = this.props.game.status;
    let display = status === "playing" ? true : false;
    let translator = i18n.createTranslator("Common.actionButtonLabel", ActionComponent.getLang());
    return (
      <div className="draw-section">
        <div style={this.props.cssmanager.drawActionSection()}>Game status : {status}</div>
        {display ? (
          <ul>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                style={this.props.cssmanager.buttonStyle()}
                onClick={this._drawRequest.bind(this)}
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
                onClick={this._resignGame.bind(this)}
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
                  style={{
                    outline: "none",
                    border: "1px #9c9c9c solid",
                    padding: "6px 3px",
                    borderRadius: "5px",
                    marginTop: "7px"
                  }}
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
          </ul>
        ) : (
          <ul>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button style={this.props.cssmanager.buttonStyle()}>
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("draw")}
                  alt="Draw"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                New Oppenent
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button style={this.props.cssmanager.buttonStyle()}>
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("resign")}
                  alt="Resign"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                Rematch
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <span style={this.props.cssmanager.spanStyle("form")}>
                <select
                  style={{
                    outline: "none",
                    border: "1px #9c9c9c solid",
                    padding: "6px 3px",
                    borderRadius: "5px",
                    marginTop: "7px"
                  }}
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
          </ul>
        )}
      </div>
    );
  }
}
export default ActionComponent;
