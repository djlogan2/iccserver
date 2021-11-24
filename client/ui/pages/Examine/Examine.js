import React, { Component } from "react";
import ExaminePage from "../components/ExaminePage/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { get } from "lodash";
import { Logger } from "../../../../lib/client/Logger";
import CssManager from "../components/Css/CssManager";
import Loading from "../components/Loading/Loading";
import GameListModal from "../components/Modaler/GameListModal";
import Chess from "chess.js/chess";
import { Game, ImportedGameCollection, mongoCss } from "../../../../imports/api/client/collections";
import { areArraysOfObectsEqual, isReadySubscriptions } from "../../../utils/utils";
import {
  DEFAULT_CAPTURE,
  gameStatusExamining,
  gameStatusNone,
  GAME_OBSERVE_DEFAULT,
} from "../../../constants/gameConstants";
import { MY_GAMES_MODAL_OPENED } from "../../../constants/systemConstants";

const log = new Logger("client/Examine_js");

let handleError = (error) => {
  if (error) {
    log.error(error);
  }
};

class Examine extends Component {
  constructor(props) {
    super(props);

    this._board = new Chess.Chess();

    this.state = {
      fileData: null,
      importedGames: [],
      isImportedGamesModal: false,
    };
  }

  initExamine = () => {
    const myGamesModalOpened = localStorage.getItem(MY_GAMES_MODAL_OPENED);
    localStorage.removeItem(MY_GAMES_MODAL_OPENED);

    if (myGamesModalOpened) return;

    Meteor.call(
      "startLocalExaminedGame",
      "startlocalExaminedGame",
      "Mr white",
      "Mr black",
      0,
      (err) => {
        if (err) {
          log.error(err);
        }
      }
    );
  };

  handleDraw = (objectList) => {
    const { game } = this.props;

    if (!game) return;

    const { circles = [], arrows = [], _id } = game;

    const circleList = objectList.filter(({ orig, mouseSq }) => orig === mouseSq);
    const arrowList = objectList.filter(({ orig, mouseSq }) => orig !== mouseSq);

    const circlesToAdd = circleList.filter((circle) => {
      let index = circles.findIndex((circleItem) => circleItem.square === circle.orig);
      return index === -1;
    });

    const circlesToRemove = circleList.filter((circle) => {
      let index = circles.findIndex((circleItem) => circleItem.square === circle.orig);
      return index !== -1;
    });

    const arrowsToAdd = arrowList.filter((arrow) => {
      const index = arrows.findIndex((arrowItem) => {
        return arrowItem.from === arrow.orig && arrowItem.to === arrow.dest;
      });
      return index === -1;
    });

    const arrowsToRemove = arrowList.filter((arrow) => {
      const index = arrows.findIndex((arrowItem) => {
        return arrowItem.from === arrow.orig && arrowItem.to === arrow.dest;
      });
      return index !== -1;
    });

    if (circlesToAdd.length) {
      this.drawCircles(_id, circlesToAdd);
    }

    if (arrowsToAdd.length) {
      this.drawArrows(_id, arrowsToAdd);
    }

    if (circlesToRemove.length) {
      this.removeCircles(_id, circlesToRemove);
    }

    if (arrowsToRemove.length) {
      this.removeArrows(_id, arrowsToRemove);
    }
  };

  drawCircles = (gameId, list) => {
    list.forEach((item) => {
      const { brush, orig } = item;
      const size = 1; // hardcode

      Meteor.call("drawCircle", "DrawCircle", gameId, orig, brush, size, handleError);
    });
  };

  removeCircles = (gameId, list) => {
    list.forEach((item) => {
      const { orig } = item;

      Meteor.call("removeCircle", "RemoveCircle", gameId, orig, handleError);
    });
  };

  drawArrows = (gameId, list) => {
    list.forEach((item) => {
      const { brush, mouseSq, orig } = item;
      const size = 1; // hardcode

      Meteor.call("drawArrow", "DrawArrow", gameId, orig, mouseSq, brush, size, handleError);
    });
  };

  removeArrows = (gameId, list) => {
    list.forEach((item) => {
      const { mouseSq, orig } = item;

      Meteor.call("removeArrow", "RemoveArrow", gameId, orig, mouseSq, handleError);
    });
  };

  _pieceSquareDragStop = (raf) => {
    const { game } = this.props;

    const currentCmi = get(game, "variations.cmi");
    const currentVariation = get(game, `variations.movelist[${currentCmi}].variations`, []);

    const variation = currentVariation.length ? { type: "append" } : null;

    Meteor.call("addGameMove", "gameMove", game._id, raf.move, variation);
  };

  handleObserveUser = (userId) => {
    Meteor.call("observeUser", "observeUser", userId, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  handleUnObserveUser = (userId) => {
    const { game } = this.props;

    if (game) {
      Meteor.call("unObserveUser", "unObserveUser", userId, game._id, (err) => {
        if (err) {
          log.error(err);
        }
      });
    }
  };

  handlePgnUpload = (fileData) => {
    this.setState({ fileData });
  };

  componentDidMount() {
    const { game } = this.props;

    if (!game) {
      this.initExamine();
    }
  }

  componentDidUpdate(prevProps) {
    const { importedGames = [], game } = this.props;
    const { fileData } = this.state;

    if (
      importedGames &&
      prevProps.importedGames &&
      !areArraysOfObectsEqual(importedGames, prevProps.importedGames)
    ) {
      const copyOfImportedGames = fileData
        ? importedGames.filter((game) => game.fileRef === fileData._id)
        : importedGames;
      this.setState({
        importedGames: copyOfImportedGames,
        isImportedGamesModal: !!fileData,
      });
    }

    const user = Meteor.user();
    const userStatus = get(user, "status.game");

    if (
      (userStatus === gameStatusExamining && game?.status !== gameStatusExamining) ||
      userStatus === gameStatusNone
    ) {
      this.initExamine();
    }
  }

  handleImportedGames = () => {
    const { importedGames } = this.props;

    this.setState({
      importedGames,
      fileData: null,
      isImportedGamesModal: true,
    });
  };

  render() {
    const { isReady, game, systemCss } = this.props;
    const { isImportedGamesModal, importedGames } = this.state;

    let fullGame = { ...game };

    if (!isReady || !game || !game.fen) {
      return <Loading />;
    }

    if (!game.examiners || !game.examiners.some((user) => user.id === Meteor.userId())) {
      fullGame = game || GAME_OBSERVE_DEFAULT;
    }

    const css = new CssManager(systemCss?.systemCss || {}, systemCss?.userCss || {});
    this._board.load(game.fen);

    return (
      <>
        <GameListModal
          isImported={true}
          visible={isImportedGamesModal}
          gameList={importedGames}
          onClose={() => {
            this.setState({ isImportedGamesModal: false });
          }}
        />
        <ExaminePage
          cssManager={css}
          board={this._board}
          observeUser={this.handleObserveUser}
          unObserveUser={this.handleUnObserveUser}
          onPgnUpload={this.handlePgnUpload}
          capture={DEFAULT_CAPTURE}
          game={fullGame}
          onImportedGames={this.handleImportedGames}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
        />
      </>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    chats: Meteor.subscribe("chat"),
    child_chat_texts: Meteor.subscribe("child_chat_texts"),
    game: Meteor.subscribe("games"),
    importedGame: Meteor.subscribe("imported_games"),
    users: Meteor.subscribe("loggedOnUsers"),
    dynamic_ratings: Meteor.subscribe("DynamicRatings"),
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    game: Game.findOne({ "observers.id": Meteor.userId() }),
    importedGames: ImportedGameCollection.find().fetch(),
    systemCss: mongoCss.findOne(),
  };
})(Examine);
