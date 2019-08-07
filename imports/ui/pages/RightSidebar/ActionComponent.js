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
      <div class="draw-section">
        <ul>
          {/* 
		Take back request Component
		Player can request to take back the last move to the
		opponent Player. 
		*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <a href="#/" title={translator("takeBack")}>
              <span>
                <img
                  src={this.props.CssManager.actionButtonImage("takeBack")}
                  alt="TakeBack"
                />
              </span>
              {translator("takeBack")}
            </a>
          </li>
          {/* 
		Draw request Component
		Player can draw arrow and circle on the board.
		*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <a href="#/" title={translator("resign")}>
              <span>
                <img
                  src={this.props.CssManager.actionButtonImage("draw")}
                  alt="Draw"
                />
              </span>
              {translator("draw")}
            </a>
          </li>
          {/*
							Resign Component
							Players can resign the game.
							*/}
          <li style={this.props.CssManager.drawSectionList()}>
            <a href="#/" title={translator("resign")}>
              <span>
                <img
                  src={this.props.CssManager.actionButtonImage("resign")}
                  alt="Resign"
                />
              </span>
              {translator("resign")}
            </a>
          </li>
          {/* 
						Game abort Component
            Players can abort the game. */}
          <li style={this.props.CssManager.drawSectionList()}>
            <a href="#/" title={translator("abort")}>
              <span>
                <img
                  src={this.props.CssManager.actionButtonImage("abort")}
                  alt="Abort"
                />
              </span>
              {translator("abort")}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
export default ActionComponent;
