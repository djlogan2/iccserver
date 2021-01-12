import React, { Component } from "react";
import { Button, Modal } from "antd";
import { translate } from "../../../HOCs/translate";

class PlayModaler extends Component {
  handleCancel = () => {
    const { clientMessage } = this.props;

    Meteor.call("acknowledge.client.message", clientMessage._id);
  };

  getTitleText = gameResult => {
    const { translate } = this.props;

    switch (gameResult) {
      case "1-0":
        return translate("whiteWon");
      case "0-1":
        return translate("blackWon");
      case "1/2-1/2":
        return translate("gameDrawn");
      default:
        return translate("unknownResult") + gameResult;
    }
  };

  render() {
    const { clientMessage, gameResult, userName, opponentName, translate, visible } = this.props;

    const titleText = this.getTitleText(gameResult);
    const message = clientMessage ? clientMessage.message : "";

    return (
      <Modal
        title={titleText}
        visible={visible}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div className="play-modal">
          <div className="play-modal__main">
            <div className="play-modal__user-one">
              <img
                className="play-modal__user-img"
                src="images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className="play-modal__user-name">{userName}</p>
            </div>
            <div className="play-modal__main-center">
              <span className="play-modal__game-short-status">{gameResult}</span>
              <p className="play-modal__game-status">{message}</p>
            </div>
            <div className="play-modal__user-two">
              <img
                className="play-modal__user-img"
                src="images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className="play-modal__user-name">{opponentName}</p>
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
              {translate("rematch")}
            </Button>
            <Button
              onClick={() => {
                this.props.onExamine();
                this.handleCancel();
              }}
              className="play-modal__btn"
            >
              {translate("examine")}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default translate("Play.PlayModaler")(PlayModaler);
