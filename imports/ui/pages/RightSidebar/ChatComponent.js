import React, { Component } from "react";
import { Meteor } from "meteor/meteor";

import { translate } from "../../HOCs/translate";

class ChatComponent extends Component {
  acceptGameSeek = requestId => {
    Meteor.call("acceptLocalGameSeek", "gameSeek", requestId);
  };

  removeAcknowledgeMessage = messageId => {
    Meteor.call("acknowledge.client.message", messageId);
  };

  gameSeekRequest = requestId => {
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
          onClick={() => this.acceptGameSeek(requestId)}
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

  render() {
    const { translate, cssManager, clientMessage, gameRequest: request } = this.props;
    let gameSeekPopup;
    let message;

    if (clientMessage) {
      message = clientMessage;
    }

    if (request && request.type === "seek" && request.owner !== Meteor.userId()) {
      gameSeekPopup = this.gameSeekRequest(request._id);
    }

    return (
      <div>
        {gameSeekPopup}
        <div style={cssManager.chatContent()}>
          {!!message && (
            <div className="user-1">
              <h6>{translate("NEW_MESSAGE")}</h6>
              <p>
                {message.message}
                <button
                  style={cssManager.buttonStyle()}
                  onClick={() => this.removeAcknowledgeMessage(message._id)}
                >
                  <img src={cssManager.buttonBackgroundImage("deleteSign")} alt="deleteSign" />
                </button>
              </p>
            </div>
          )}
          <div className="user-1">
            <h6>{translate("newGame")}</h6>
            <p>
              <a href="#/">jack833</a> (639) vs. <a href="#/">York-Duvenhage</a>
              (657) (10 min) win +85 / draw +4 / lose -77
              <a href="#/">Try Focus Mode</a>
            </p>
          </div>
          <div className="user-1">
            <h6>{translate("newGame")}</h6>
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
        <div style={cssManager.inputBoxStyle("chat")}>
          <input type="text" placeholder="Message..." />
          <button style={cssManager.buttonStyle()} type="send">
            <img src={cssManager.buttonBackgroundImage("chatSendButton")} alt="Send" />
          </button>
        </div>
      </div>
    );
  }
}

export default translate("Common.chatBoxMessage")(ChatComponent);
