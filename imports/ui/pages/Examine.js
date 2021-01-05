import React, { Component } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import GameListModal from "./components/Modaler/GameListModal";
import Chess from "chess.js";
import {
  ClientMessagesCollection,
  Game,
  ImportedGameCollection,
  mongoCss,
  mongoUser
} from "../../api/client/collections";
import { areArraysOfObectsEqual, isReadySubscriptions } from "../../utils/utils";
import { RESOURCE_LOGIN } from "../../constants/resourceConstants";
import { defaultCapture } from "../../constants/gameConstants";

const log = new Logger("client/Examine_js");

let handleError = error => {
  if (error) {
    log.error(error);
  }
};

class Examine extends Component {
  constructor(props) {
    super(props);

    this.userId = null;
    // TODO: You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;

    this.state = {
      fileData: null,
      importedGames: [],
      isImportedGamesModal: false
    };
  }

  componentDidMount() {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  initExamine = () => {
    Meteor.call("startLocalExaminedGame", "startlocalExaminedGame", "Mr white", "Mr black", 0);
  };

  userRecord = () => {
    return mongoUser.find().fetch();
  };

  handleDraw = objectList => {
    const { game } = this.props;

    if (!game) return;

    const { circles, arrows, _id } = game;

    const circleList = objectList.filter(({ orig, mouseSq }) => orig === mouseSq);
    const arrowList = objectList.filter(({ orig, mouseSq }) => orig !== mouseSq);

    const circlesToAdd = circleList.filter(circle => {
      let index = circles.findIndex(circleItem => circleItem.square === circle.orig);
      return index === -1;
    });

    const circlesToRemove = circleList.filter(circle => {
      let index = circles.findIndex(circleItem => circleItem.square === circle.orig);
      return index !== -1;
    });

    const arrowsToAdd = arrowList.filter(arrow => {
      const index = arrows.findIndex(arrowItem => {
        return arrowItem.from === arrow.orig && arrowItem.to === arrow.dest;
      });
      return index === -1;
    });

    const arrowsToRemove = arrowList.filter(arrow => {
      const index = arrows.findIndex(arrowItem => {
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
    list.forEach(item => {
      const { brush, orig } = item;
      const size = 1; // hardcode

      Meteor.call("drawCircle", "DrawCircle", gameId, orig, brush, size, handleError);
    });
  };

  removeCircles = (gameId, list) => {
    list.forEach(item => {
      const { orig } = item;

      Meteor.call("removeCircle", "RemoveCircle", gameId, orig, handleError);
    });
  };

  drawArrows = (gameId, list) => {
    list.forEach(item => {
      const { brush, mouseSq, orig } = item;
      const size = 1; // hardcode

      Meteor.call("drawArrow", "DrawArrow", gameId, orig, mouseSq, brush, size, handleError);
    });
  };

  removeArrows = (gameId, list) => {
    list.forEach(item => {
      const { mouseSq, orig } = item;

      Meteor.call("removeArrow", "RemoveArrow", gameId, orig, mouseSq, handleError);
    });
  };

  _pieceSquareDragStop = raf => {
    const { game } = this.props;

    if (!game) {
      log.error("How are we dropping pieces on a non-examined game?");
      return;
    }

    Meteor.call("addGameMove", "gameMove", game._id, raf.move);
  };

  handleObserveUser = userId => {
    const { game } = this.props;

    if (game) {
      this.setState({ leaving_game: game._id });
    }

    Meteor.call("observeUser", "observeUser", userId, err => {
      if (err) {
        log.error(err);
      }
    });
  };

  _boardFromMongoMessages(game) {
    let position = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
    };

    const shortfen = game.fen.split(" ")[0];
    let i = shortfen.length;

    while (i--) {
      let pc = shortfen.charAt(i);
      let color = pc > "A" ? "w" : "b";
      pc = pc.toLowerCase();
      position[color][pc]--;
    }

    return position;
  }

  getCoordinatesToRank(square) {
    const file = square.square.charAt(0);
    const rank = parseInt(square.square.charAt(1));
    const fileNumber = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const fileNo = fileNumber.indexOf(file);

    return { rank: rank - 1, file: fileNo, lineWidth: square.size, color: square.color };
  }

  clientMessages(id) {
    return ClientMessagesCollection.findOne({
      $or: [
        { client_identifier: "matchRequest" },
        { $and: [{ to: Meteor.userId() }, { client_identifier: id }] }
      ]
    });
  }

  handlePgnUpload = fileData => {
    this.setState({ fileData });
  };

  componentDidUpdate(prevProps) {
    const { importedGames } = this.props;
    const { fileData } = this.state;

    if (
      importedGames &&
      prevProps.importedGames &&
      !areArraysOfObectsEqual(importedGames, prevProps.importedGames)
    ) {
      this.setState({
        importedGames,
        isImportedGamesModal: !!fileData
      });
    }
  }

  renderObserver() {
    const { systemCss, boardCss, allUsers, game: gameFromProps } = this.props;
    const { isImportedGamesModal, importedGames } = this.state;

    const game = gameFromProps || {
      _id: "bogus",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      white: { id: "bogus", name: "White", rating: 1600 },
      black: { id: "bogus", name: "White", rating: 1600 }
    };

    const css = new CssManager(systemCss, boardCss);

    return (
      <div className="examine">
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
          allUsers={allUsers}
          board={this._board}
          observeUser={this.handleObserveUser}
          onPgnUpload={this.handlePgnUpload}
          capture={defaultCapture}
          game={game}
          onDrop={this._pieceSquareDragStop}
          ref="main_page"
        />
      </div>
    );
  }

  render() {
    const { allUsers, isReady, game, systemCss, boardCss } = this.props;
    const { isImportedGamesModal, importedGames, leaving_game } = this.state;

    if (!isReady) {
      return <Loading />;
    }

    if (!game) {
      if (!leaving_game) {
        this.initExamine();
      }

      return <Loading />;
    } else if (game._id === leaving_game) {
      return <Loading />;
    }

    if (!game.examiners || !game.examiners.some(user => user.id === Meteor.userId())) {
      return this.renderObserver();
    }

    const css = new CssManager(systemCss, boardCss);
    this._board.load(game.fen);

    return (
      <div className="examine">
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
          allUsers={allUsers}
          board={this._board}
          observeUser={this.handleObserveUser}
          onPgnUpload={this.handlePgnUpload}
          capture={defaultCapture}
          game={game}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          ref="main_page"
        />
      </div>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    chats: Meteor.subscribe("chat"),
    child_chat_texts: Meteor.subscribe("child_chat_texts"),
    clientMessages: Meteor.subscribe("client_messages"),
    game: Meteor.subscribe("games"),
    importedGame: Meteor.subscribe("imported_games"),
    users: Meteor.subscribe("loggedOnUsers"),
    userData: Meteor.subscribe("userData")
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    game: Game.findOne({ "observers.id": Meteor.userId() }),
    allUsers: Meteor.users.find().fetch(),
    importedGames: ImportedGameCollection.find().fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Examine);
