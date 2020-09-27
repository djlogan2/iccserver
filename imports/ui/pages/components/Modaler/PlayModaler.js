import React, { Component } from "react";
import { Modal, Button } from "antd";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/PlayModaler_js");

export default class PlayModaler extends Component {
  handleCancel = () => {
    Meteor.call("acknowledge.client.message", this.props.clientMessage._id);
  };

  render() {
    log.trace("PlayModaler render", this.props);
    let titleText;
    let message = !this.props.clientMessage ? "" : this.props.clientMessage.message;

    switch (this.props.gameResult) {
      case "1-0":
        titleText = "White won!";
        break;
      case "0-1":
        titleText = "Black won!";
        break;
      case "1/2-1/2":
        titleText = "Game drawn!";
        break;
      default:
        titleText = "Unknown result " + this.props.gameResult;
        break;
    }

    return (
      <Modal
        title={titleText}
        visible={this.props.visible}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div className="play-modal">
          <div className="play-modal__main">
            <div className="play-modal__user-one">
              <img className="play-modal__user-img" src="images/player-img-top.png" alt="user" />
              <p className="play-modal__user-name">{this.props.userName}</p>
            </div>
            <div className="play-modal__main-center">
              <span className="play-modal__game-short-status">{this.props.gameResult}</span>
              <p className="play-modal__game-status">{message}</p>
            </div>
            <div className="play-modal__user-two">
              <img className="play-modal__user-img" src="images/player-img-top.png" alt="user" />
              <p className="play-modal__user-name">{this.props.opponentName}</p>
            </div>
          </div>
          <div className="play-modal__btn-block">
            <Button
              type="primary"
              onClick={() => {
                this.props.onRematch();
                this.handleCancel();
              }}
              className="play-modal__btn play-modal__btn--primary"
            >
              Rematch
            </Button>
            <Button
              onClick={() => {
                this.props.onExamine();
                this.handleCancel();
              }}
              className="play-modal__btn"
            >
              Examine
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
