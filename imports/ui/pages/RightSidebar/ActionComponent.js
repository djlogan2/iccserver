import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
class ActionComponent extends Component {
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
    let translator = i18n.createTranslator(
      "Common.actionButtonLabel",
      this.getLang()
    );
    return (
      <div className="draw-section">
        <ul>
          {/* 
		Take back request Component
		Player can request to take back the last move to the
		opponent Player. 
		*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <button style={this.props.CssManager.buttonStyle()}>
              <img
                src={this.props.CssManager.buttonBackgroundImage("takeBack")}
                alt="TakeBack"
              />
              {translator("takeBack")}
            </button>
          </li>
          {/* 
		Draw request Component
		Player can draw arrow and circle on the board.
		*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <button style={this.props.CssManager.buttonStyle()}>
              <img
                src={this.props.CssManager.buttonBackgroundImage("draw")}
                alt="Draw"
              />
              {translator("draw")}
            </button>
          </li>
          {/*
							Resign Component
							Players can resign the game.
							*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <button style={this.props.CssManager.buttonStyle()}>
              <img
                src={this.props.CssManager.buttonBackgroundImage("resign")}
                alt="Resign"
              />
              {translator("resign")}
            </button>
          </li>
          {/* 
						Game abort Component
            Players can abort the game. */}
          <li style={this.props.CssManager.drawSectionList()}>
            <button style={this.props.CssManager.buttonStyle()}>
              <img
                src={this.props.CssManager.buttonBackgroundImage("abort")}
                alt="Abort"
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
