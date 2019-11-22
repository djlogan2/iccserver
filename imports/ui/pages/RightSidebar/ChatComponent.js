import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

export default class ChatComponent extends Component {
  acceptGameSeek() {
    Meteor.call("acceptLocalGameSeek", "gameSeek");
  }

  gameSeekRequest = () => {
    return (
      <div
        style={{
          width: "200px",
          background: "#00BFFF",
          margin: "5px",
          color: "white",
          padding: "5px",
          borderRadius: "5px",
          display: "inline-block",
          textAlign: "center"
        }}
      >
        <span style={{ width: "100%", float: "left" }}>NEW GAME SEEK</span>
        <button
          onClick={this.acceptGameSeek.bind(this)}
          style={{
            backgroundColor: "#1565c0",
            border: "none",
            color: "white",
            padding: "5px 10px",
            textAign: "center",
            textDecoration: "none",
            display: "inline-block",
            fontSize: "12px",
            borderRadius: "5px",
            marginTop: "15px"
          }}
        >
          START
        </button>
      </div>
    );
  };
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
      "Common.chatBoxMessage",
      this.getLang()
    );
    let gameSeekPopup = null;
    const request = this.props.gameRequest;
    const newClientMessage = this.props.clientMessage;
    let message = null;
    if (newClientMessage !== undefined) {
      message = translator(newClientMessage.message);
    }
    if (request !== undefined)
      if (request.type === "seek" && request.owner !== Meteor.userId())
        gameSeekPopup = this.gameSeekRequest();

    return (
      <div>
        {gameSeekPopup}
        <div style={this.props.cssmanager.chatContent()}>
          {newClientMessage ? (
            <div className="user-1">
              <h6>{translator("NEW_MESSAGE")}</h6>
              <p>{message}</p>
            </div>
          ) : null}
          <div className="user-1">
            <h6>NEW GAME</h6>
            <p>
              <a href="#/">jack833</a> (639) vs. <a href="#/">York-Duvenhage</a>
              (657) (10 min) win +85 / draw +4 / lose -77
              <a href="#/">Try Focus Mode</a>
            </p>
          </div>
          <div className="user-1">
            <h6>NEW GAME</h6>
            <p>
              <a href="#/">jack833</a> (639) vs. <a href="#/">York-Duvenhage</a>
              (657) (10 min) win +85 / draw +4 / lose -77
              <a href="#/">Try Focus Mode</a>
            </p>
          </div>
          <div className="user-2">
            <h6>GAME ABORTED</h6>
            <p>
              <a href="#/">jack833</a> (639) vs. <a href="#/">York-Duvenhage</a>
              (657) (10 min rated) Game has been aborted by the server
            </p>
          </div>
        </div>
        <div style={this.props.cssmanager.inputBoxStyle("chat")}>
          <input type="text" placeholder="Message..." />
          <button style={this.props.cssmanager.buttonStyle()} type="send">
            <img
              src={this.props.cssmanager.buttonBackgroundImage(
                "chatSendButton"
              )}
              alt="Send"
            />
          </button>
        </div>
      </div>
    );
  }
}
