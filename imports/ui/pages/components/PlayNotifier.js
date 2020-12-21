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

    //
    // TODO: As I said before, I do not think:
    //    (1) These should not be "popups."
    //    (2) There can be virtually every single type of request active all at the same time. How are you going to handle this? (and this goes back to #1)
    //    Other than "renderActionPopup", the if/else/else bothers me. It seems to me that you will never show more than one of these requests at a time,
    //    in some "order of importance" that you defined, yes?  Like if a takeback is pending, user won't see a draw request?
    //
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
