import { Button, Modal } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import { RESOURCE_EXAMINE } from "../../../../../constants/resourceConstants";
import { translate } from "../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";

class PlayModaler extends Component {
  handleCancel = () => {
    const { clientMessage, history } = this.props;

    Meteor.call("acknowledge.client.message", clientMessage._id);
    history.push(RESOURCE_EXAMINE);
  };

  handleRematch = () => {
    const { clientMessage, onRematch } = this.props;

    Meteor.call("acknowledge.client.message", clientMessage._id);
    onRematch();
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
              id="rematch-button"
              type="primary"
              onClick={this.handleRematch}
              className={classes.buttonPrimary}
            >
              {translate("rematch")}
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
  withDynamicStyles("css.playModalCss"),
  withRouter
)(PlayModaler);
