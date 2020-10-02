import React from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Chess from "chess.js";
import { Tracker } from "meteor/tracker";
import {
  ClientMessagesCollection,
  Game,
  GameHistoryCollection,
  GameRequestCollection,
  ImportedGameCollection,
  mongoCss,
  mongoUser
} from "../../api/client/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/AppContainer");

let played_game_id;
let game_timestamp_client;

Game.find().observe({
  changed(newDocument) {
    if (newDocument.status === "examining") {
      return;
    }

    const color =
      newDocument.white.id === Meteor.userId()
        ? "white"
        : newDocument.black.id === Meteor.userId()
        ? "black"
        : "?";
    if (color === "?") return;

    if (played_game_id !== newDocument._id) {
      game_timestamp_client = new TimestampClient("client game", (_, msg) =>
        Meteor.call("gamepong", newDocument._id, msg)
      );
      newDocument.lag[color].active.forEach(ping => game_timestamp_client.pingArrived(ping));
    }
  }
});

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  log.error(errorMsg + "::" + url + "::" + lineNumber);
  return false;
};

Meteor.startup(() => {
  Tracker.autorun(() => {
    //
    // This is in here so when the user navigates away from the page,
    // the subscription is stopped on the server, cleaning up.
    //
    Meteor.subscribe("userData");
    Meteor.subscribe("observing_games");
  });
});

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    log.trace("AppContainer constructor", props);
    this.gameId = null;
    this.userId = null;
    // You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;
    this.state = {
      gameId: null,
      GameHistory: null,
      subscription: {
        css: Meteor.subscribe("css"),
        game: Meteor.subscribe("playing_games"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages"),
        observingGames: Meteor.subscribe("observing_games"),
        gameHistory: Meteor.subscribe("game_history"),
        importedGame: Meteor.subscribe("imported_games")
      }
    };
    this.logout = this.logout.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.removeCircle = this.removeCircle.bind(this);
    this.gameHistoryload = this.gameHistoryload.bind(this);
    this.removeGameHistory = this.removeGameHistory.bind(this);
  }

  renderGameMessages() {
    return Game.findOne({
      $and: [
        { status: "playing" },
        {
          $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
        }
      ]
    });
  }

  examineGame() {
    return Game.findOne({ "observers.id": Meteor.userId() });
  }
  renderGameRequest() {
    return GameRequestCollection.findOne(
      {
        $or: [
          {
            challenger_id: Meteor.userId()
          },
          {
            receiver_id: Meteor.userId()
          },
          { type: "seek" }
        ]
      },
      {
        sort: { create_date: -1 }
      }
    );
  }
  _systemCSS() {
    return mongoCss.findOne({ type: "system" });
  }

  _boardCSS() {
    return mongoCss.findOne({
      $and: [{ type: "board" }, { name: "default-user" }]
    });
  }

  userRecord() {
    return mongoUser.find().fetch();
  }

  componentWillUnmount() {
    if (this.state.subscription) {
      this.state.subscription.css && this.state.subscription.css.stop();
      this.state.subscription.game && this.state.subscription.game.stop();
      this.state.subscription.gameRequests && this.state.subscription.gameRequests.stop();
      this.state.subscription.clientMessages && this.state.subscription.clientMessages.stop();
      this.state.subscription.observingGames && this.state.subscription.observingGames.stop();
      this.state.subscription.gameHistory && this.state.subscription.gameHistory.stop();
      this.state.subscription.importedGame && this.state.subscription.importedGame.stop();
    }
  }

  componentWillMount() {
    if (Meteor.userId() !== null) {
      this.props.history.push("/sign-up");
    }
  }

  componentDidMount() {
    if (Meteor.userId() !== null) {
      this.props.history.push("/home");
    }
  }

  componentDidUpdate() {
    if (Meteor.userId() !== null) {
      this.props.history.push("/home");
    }
  }

  logout(e) {
    e.preventDefault();
    Meteor.logout(err => {
      if (err) {
        log.error(err.reason);
      } else {
        this.props.history.push("/login");
      }
    });
    this.props.history.push("/login");
  }

  _fallenSoldier() {
    let history = this._boardfallensolder.history({ verbose: true });
    let position = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    return history.reduce((accumulator, move) => {
      if ("captured" in move) {
        let piece = move.captured;
        let color = move.color === "w" ? "b" : "w";
        accumulator[color][piece] += 1;
        return accumulator;
      } else {
        return accumulator;
      }
    }, position);
  }

  drawCircle(square, color, size) {
    Meteor.call("drawCircle", "DrawCircle", this.gameId, square, color, size);
  }

  removeCircle(square) {
    Meteor.call("removeCircle", "RemoveCircle", this.gameId, square);
  }

  _pieceSquareDragStop = raf => {
    Meteor.call("addGameMove", "gameMove", this.gameId, raf.move);
  };

  gameHistoryload(data) {
    if (data === "mygame") {
      const GameHistory = GameHistoryCollection.find({
        $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
      }).fetch();
      GameHistory.is_imported = false;
      this.setState({ GameHistory: GameHistory });
    } else if (data === "uploadpgn") {
      const importedGame = ImportedGameCollection.find({}).fetch();
      importedGame.is_imported = true;
      this.setState({ GameHistory: importedGame });
    }
  }

  removeGameHistory() {
    this.setState({ GameHistory: null });
  }

  _boardFromMongoMessages(game) {
    let variation = game.variations;
    this._board.load(game.fen);
    this._boardfallensolder = new Chess.Chess();
    let itemToBeRemoved = [];

    for (let i = 0; i < variation.cmi; i++) {
      if (itemToBeRemoved.indexOf(i) === -1) {
        var moveListItem = variation.movelist[i];
        if (moveListItem !== undefined) {
          var variationI = moveListItem.variations;
          if (variationI !== undefined) {
            var len = variationI.length;
            if (len === 1 && variation.movelist[variationI[0]] !== undefined) {
              this._boardfallensolder.move(variation.movelist[variationI[0]].move);
            } else if (len > 1) {
              if (variation.movelist[variationI[len - 1]] !== undefined) {
                this._boardfallensolder.move(variation.movelist[variationI[len - 1]].move);
              }
              if (variation.cmi === variationI[len - 1]) {
                break;
              }
              for (let n = variationI[0]; n < variationI[len - 1]; n++) {
                itemToBeRemoved.push(n);
              }
            }
          }
        }
      }
    }
    let history = this._boardfallensolder.history({ verbose: true });
    let position = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    return history.reduce((accumulator, move) => {
      if ("captured" in move) {
        let piece = move.captured;
        let color = move.color === "w" ? "b" : "w";
        accumulator[color][piece] += 1;
        return accumulator;
      } else {
        return accumulator;
      }
    }, position);
  }

  _examinBoard(game) {
    this._board.load(game.fen);
  }

  getCoordinatesToRank(square) {
    let file = square.square.charAt(0);
    let rank = parseInt(square.square.charAt(1));
    const fileNumber = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let fileNo = fileNumber.indexOf(file);
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
  render() {
    log.trace("AppContainer render", this.props);
    const gameRequest = this.renderGameRequest();
    let game = this.renderGameMessages();
    let circles = [];
    let actionlen;
    let gameExamin = []; // this.examineGame();
    const systemCSS = this._systemCSS();
    const boardCSS = this._boardCSS();
    let clientMessage = null;
    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };
    if (
      systemCSS === undefined ||
      boardCSS === undefined ||
      systemCSS.length === 0 ||
      boardCSS.length === 0
    )
      return <div>Loading...</div>;
    const css = new CssManager(this._systemCSS(), this._boardCSS());
    if (!!gameRequest) {
      this.gameId = gameRequest._id;
      this.message_identifier = "server:game:" + this.gameId;
    }
    if (!!game) {
      this.gameId = game._id;
      this.message_identifier = "server:game:" + this.gameId;
      actionlen = game.actions.length;
      capture = this._boardFromMongoMessages(game);
    } else {
      gameExamin = this.examineGame();
      if (!!gameExamin && gameExamin.length > 0) {
        game = gameExamin[gameExamin.length - 1];
        actionlen = game.actions.length;
        this.gameId = game._id;
        this._examinBoard(game);
        if (!!game.circles) {
          let circleslist = game.circles;
          circleslist.forEach(circle => {
            let c1 = this.getCoordinatesToRank(circle);
            circles.push(c1);
          });
        }
      }
    }

    if (!!this.gameId) {
      clientMessage = this.clientMessages(this.message_identifier);
    }

    return (
      <div>
        <MainPage
          cssManager={css}
          board={this._board}
          capture={capture}
          len={actionlen}
          game={game}
          gameHistoryload={this.gameHistoryload}
          GameHistory={this.state.GameHistory}
          removeGameHistory={this.removeGameHistory}
          gameRequest={gameRequest}
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          onDrawCircle={this.drawCircle}
          onRemoveCircle={this.removeCircle}
          ref="main_page"
        />
      </div>
    );
  }
}
