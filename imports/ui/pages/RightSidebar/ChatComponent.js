import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

export default class ChatComponent extends Component {
  render() {
    return (
      <div>
        <h3>Chat</h3>
        <div style={CssManager.chatContent()}>
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
        <div style={CssManager.chatInputBox()}>
          <input type="text" placeholder="Message..." />
          <button style={CssManager.chatSendButton()} type="send" />
        </div>
      </div>
    );
  }
}
