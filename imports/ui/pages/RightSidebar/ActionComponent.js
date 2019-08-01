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
          <li>
            <button
              title="TakeBack"
              style={this.props.CssManager.actionButtonImage("takeback")}
            >
              <img src="images/fast-forward-prev.png" alt="fast-forward" />
              {translator("takeBack")}
            </button>
          </li>
          {/* 
		Draw request Component
		Player can draw arrow and circle on the board.
		*/}
          <li>
            <button
              title="Draw"
              style={this.props.CssManager.actionButtonImage("draw")}
            >
              <img src="images/draw-icon.png" alt="draw" />
              {translator("draw")}
            </button>
          </li>
          {/*
							Resign Component
							Players can resign the game.
							*/}

          <li>
            <button
              title="Resign"
              style={this.props.CssManager.actionButtonImage("resign")}
            >
              <img src="images/resign-icon.png" alt="resign" />
              {translator("resign")}
            </button>
          </li>
          {/* 
						Game abort Component
						Players can abort the game. */}
          <li>
            <button
              title="Abort"
              style={this.props.CssManager.actionButtonImage("abort")}
            >
              <img src="images/abort-icon.png" alt="abort" />
              {translator("abort")}
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
export default ActionComponent;
