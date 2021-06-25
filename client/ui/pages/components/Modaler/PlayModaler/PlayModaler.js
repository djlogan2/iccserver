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
      whitePlayerUsername,
      blackPlayerUsername,
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
                src="images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className={classes.username}>{whitePlayerUsername}</p>
            </div>
            <div className={classes.mainCenter}>
              <span>{gameResult}</span>
              <p>{clientMessage?.message || ""}</p>
            </div>
            <div className={classes.userTwo}>
              <img
                className={classes.userImg}
                src="images/player-img-top.png"
                alt={translate("userImage")}
              />
              <p className={classes.username}>{blackPlayerUsername}</p>
            </div>
          </div>
          <div className={classes.buttonBlock}>
            <Button
              type="primary"
              onClick={() => {
                onRematch();
                this.handleCancel();
              }}
              className={classes.buttonPrimary}
            >
              {translate("rematch")}
            </Button>
            <Button
              onClick={() => {
                onExamine();
                this.handleCancel();
              }}
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
