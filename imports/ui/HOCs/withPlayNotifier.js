import React from "react";
import renderNotification from "../pages/components/Notification";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import CssManager from "../pages/components/Css/CssManager";

export const withPlayNotifier = WrappedComponent => {
  return class extends React.Component {
    renderActionPopup = (title, action) => {
      const { systemCss, boardCss, classes, inGame: game } = this.props;

      renderNotification({
        title,
        action,
        classes,
        cssManager: new CssManager(systemCss, boardCss),
        gameId: game._id
      });
    };

    render() {
      const { inGame: game } = this.props;

      const translate = i18n.createTranslator("Common.MainPage");

      if (game && game.pending) {
        const othercolor = Meteor.userId() === game.white.id ? "black" : "white";

        if (game.pending[othercolor].takeback.number !== 0) {
          const moveCount =
            game.pending[othercolor].takeback.number === 1 ? "halfmove" : "fullmove";
          this.renderActionPopup(translate(moveCount), "takeBack");
        }

        if (game.pending[othercolor].draw !== "0") {
          this.renderActionPopup(translate("draw"), "draw");
        }

        if (game.pending[othercolor].adjourn !== "0") {
          this.renderActionPopup(translate("adjourn"), "adjourn");
        }

        if (game.pending[othercolor].abort !== "0") {
          this.renderActionPopup(translate("abort"), "abort");
        }
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};
