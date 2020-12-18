import React, { Component } from "react";
import { ActionPopup } from "./Popup";
import { Meteor } from "meteor/meteor";
import { translate } from "../../HOCs/translate";

class PlayNotifier extends Component {
  renderActionPopup = (title, action) => {
    const { game, cssManager } = this.props;

    return <ActionPopup gameID={game._id} title={title} action={action} cssManager={cssManager} />;
  };

  render() {
    const { translate, game } = this.props;

    if (!game || !game.pending) {
      return null;
    }

    const othercolor = Meteor.userId() === game.white.id ? "black" : "white";

    if (game.pending[othercolor].takeback.number !== 0) {
      const moveCount = game.pending[othercolor].takeback.number === 1 ? "halfmove" : "fullmove";
      return this.renderActionPopup(translate(moveCount), "takeBack");
    } else if (game.pending[othercolor].draw !== "0") {
      return this.renderActionPopup(translate("draw"), "draw");
    } else if (game.pending[othercolor].adjourn !== "0") {
      return this.renderActionPopup("Adjourn", "adjourn");
    } else if (game.pending[othercolor].abort !== "0") {
      return this.renderActionPopup(translate("abort"), "abort");
    }

    return null;
  }
}

export default translate("Common.MainPage")(PlayNotifier);
