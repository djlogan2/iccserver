import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
import CssManager from "../../pages/components/Css/CssManager";

class ActionComponent extends Component {
  static getLang() {
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
      ActionComponent.getLang()
    );
    return (
      <div className="draw-section">
        <ul>
          {/* 
		Take back request Component
		Player can request to take back the last move to the
		opponent Player. 
		*/}
          <li style={CssManager.drawSectionList()}>
            <button style={CssManager.buttonStyle()}>
              <img
                src={CssManager.buttonBackgroundImage("takeBack")}
                alt="TakeBack"
                style={{ margin: "0 auto", display: "block" }}
              />
              {translator("takeBack")}
            </button>
          </li>
          {/* 
		Draw request Component
		Player can draw arrow and circle on the board.
		*/}
          <li style={CssManager.drawSectionList()}>
            <button style={CssManager.buttonStyle()}>
              <img
                src={CssManager.buttonBackgroundImage("draw")}
                alt="Draw"
                style={{ margin: "0 auto", display: "block" }}
              />
              {translator("draw")}
            </button>
          </li>
          {/*
							Resign Component
							Players can resign the game.
							*/}
          <li style={CssManager.drawSectionList()}>
            <button style={CssManager.buttonStyle()}>
              <img
                src={CssManager.buttonBackgroundImage("resign")}
                alt="Resign"
                style={{ margin: "0 auto", display: "block" }}
              />
              {translator("resign")}
            </button>
          </li>
          {/* 
						Game abort Component
            Players can abort the game. */}
          <li style={CssManager.drawSectionList()}>
            <button style={CssManager.buttonStyle()}>
              <img
                src={CssManager.buttonBackgroundImage("abort")}
                alt="Abort"
                style={{ margin: "0 auto", display: "block" }}
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
