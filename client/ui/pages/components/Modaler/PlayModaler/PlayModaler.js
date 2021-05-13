import React, { Component } from "react";
import { Button, Modal } from "antd";
import { compose } from "redux";
import { translate } from "../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

class PlayModaler extends Component {
  handleCancel = () => {
    const { clientMessage } = this.props;

    Meteor.call("acknowledge.client.message", clientMessage._id);
  };

  getTitleText = (gameResult) => {
    const { translate } = this.props;

    switch (gameResult) {
      case "1-0":
        return translate("whiteWon");
      case "0-1":
        return translate("blackWon");
      case "1/2-1/2":
        return translate("gameDrawn");
      default:
        return gameResult;
    }
  };

  render() {
    const {
      classes,
      clientMessage,
      gameResult,
      userName,
      opponentName,
      translate,
      visible,
      onExamine,
      onRematch,
    } = this.props;

    return (
      <Modal
        title={this.getTitleText(gameResult)}
        visible={visible}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div>
          <div className={classes.main}>
            <div className={classes.userOne}>
              <img
                className={classes.userImg}
                src="../../../../../../public/images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className="play-modal__user-name">{userName}</p>
            </div>
            <div className="play-modal__main-center">
              <span className="play-modal__game-short-status">{gameResult}</span>
              <p className="play-modal__game-status">{clientMessage?.message || ""}</p>
            </div>
            <div className="play-modal__user-two">
              <img
                className="play-modal__user-img"
                src="../../../../../../public/images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className="play-modal__user-name">{opponentName}</p>
            </div>
          </div>
          <div className="play-modal__btn-block">
            <Button
              type="primary"
              onClick={() => {
                onRematch();
                this.handleCancel();
              }}
              className="play-modal__btn play-modal__btn--primary"
            >
              {translate("rematch")}
            </Button>
            <Button
              onClick={() => {
                onExamine();
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

export default compose(
  translate("Play.PlayModaler"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(PlayModaler);
