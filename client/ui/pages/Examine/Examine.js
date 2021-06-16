import React, { Component } from "react";
import ExaminePage from "../components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../../lib/client/Logger";
import CssManager from "../components/Css/CssManager";
import Loading from "../components/Loading/Loading";
import GameListModal from "../components/Modaler/GameListModal";
import Chess from "chess.js/chess";
import { Game, ImportedGameCollection, mongoCss } from "../../../../imports/api/client/collections";
import { areArraysOfObectsEqual, isReadySubscriptions } from "../../../utils/utils";
import { RESOURCE_LOGIN } from "../../../constants/resourceConstants";
import { defaultCapture, gameObserveDefault } from "../../../constants/gameConstants";

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

  componentDidMount() {
    if (!Meteor.userId() && !Meteor.isAppTest) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  initExamine = () => {
    Meteor.call("startLocalExaminedGame", "startlocalExaminedGame", "Mr white", "Mr black", 0);
  };

  handleDraw = (objectList) => {
    const { game } = this.props;

    if (!game) return;

    const { circles, arrows, _id } = game;

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

    Meteor.call("addGameMove", "gameMove", game._id, raf.move);
  };

  handleObserveUser = (userId) => {
    const { game } = this.props;

    if (game) {
      this.setState({ leaving_game: game._id });
    }

    Meteor.call("observeUser", "observeUser", userId, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  handleUnObserveUser = (userId) => {
    const { game } = this.props;
    this.setState({ leaving_game: null });

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

  componentDidUpdate(prevProps) {
    const { importedGames = [] } = this.props;
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
    const { isImportedGamesModal, importedGames, leaving_game } = this.state;

    let fullGame = { ...game };

    if (!isReady || !game || game._id === leaving_game) {
      if (!leaving_game && !game && isReady) {
        this.initExamine();
      }

      return <Loading />;
    }

    if (!game.examiners || !game.examiners.some((user) => user.id === Meteor.userId())) {
      fullGame = game || gameObserveDefault;
    }

    const css = new CssManager(systemCss?.systemCss || {}, systemCss?.userCss || {});
    this._board.load(game.fen);

    return (
      <div>
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
          capture={defaultCapture}
          game={fullGame}
          onImportedGames={this.handleImportedGames}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
        />
      </div>
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
