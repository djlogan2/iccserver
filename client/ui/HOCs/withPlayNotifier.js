import React from "react";
import renderNotification from "../pages/components/Notification";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import CssManager from "../pages/components/Css/CssManager";
import { colorBlack, colorWhite, gameStatusPlaying } from "../../constants/gameConstants";

export const withPlayNotifier = (WrappedComponent) => {
  return class extends React.Component {
    renderActionPopup = (title, action) => {
      const { systemCss, classes, inGame: game } = this.props;

      const translate = i18n.createTranslator("Common.Notifier");

      renderNotification({
        title,
        action,
        classes,
        translate,
        cssManager: new CssManager(systemCss?.systemCss, systemCss?.userCss),
        gameId: game?._id,
      });
    };

    render() {
      const { inGame: game } = this.props;

      const translate = i18n.createTranslator("Common.MainPage");

      if (game && game.pending && game.status === gameStatusPlaying) {
        const othercolor = Meteor.userId() === game?.white?.id ? colorBlack : colorWhite;

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
