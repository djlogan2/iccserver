import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Modal } from "antd";
import { compose } from "redux";
import { withRouter } from "react-router-dom";

import { RESOURCE_PLAY } from "../../../../../constants/resourceConstants";
import { translate } from "../../../../HOCs/translate";

class GameRequestMatch extends Component {
  render() {
    const { translate, history, gameRequest } = this.props;

    return (
      <Modal
        title={translate("gameRequestModal.gameRequest")}
        visible={!!gameRequest}
        onOk={() => {
          Meteor.call("gameRequestAccept", "gameAccept", gameRequest._id, () => {
            history.push(RESOURCE_PLAY);
          });
        }}
        onCancel={() => {
          Meteor.call("gameRequestDecline", "gameDecline", gameRequest._id);
        }}
      >
        <p>
          {translate("gameRequestModal.challangerWantsToPlay", {
            challenger: gameRequest.challenger,
          })}
        </p>
      </Modal>
    );
  }
}

export default compose(withRouter, translate("Common.appWrapper"))(GameRequestMatch);
