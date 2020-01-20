import React from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Chess from "chess.js";
import { Tracker } from "meteor/tracker";
import {
  mongoCss,
  mongoUser,
  Game,
  GameRequestCollection,
  ClientMessagesCollection
} from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";
const log = new Logger("client/AppContainer");

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  // log.error(errorMsg + "::" + url + "::" + lineNumber);
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
    this.gameId = null;
    this.userId = null;
    // You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;
    this.state = {
      gameId: null,
      subscription: {
        css: Meteor.subscribe("css"),
        game: Meteor.subscribe("playing_games"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages"),
        observingGames: Meteor.subscribe("observing_games")
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.removeCircle = this.removeCircle.bind(this);
  }
  renderGameMessages() {
    const game = Game.findOne({
      $and: [
        { status: "playing" },

        {
          $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
        }
      ]
    });
    if (!!game) {
      const color = game.white.id === Meteor.userId() ? "white" : "black";

      if (!this.game_timestamp_client)
        this.game_timestamp_client = new TimestampClient("client game", (_, msg) =>
          Meteor.call("gamepong", game._id, msg)
        );
      game.lag[color].active.forEach(ping => this.game_timestamp_client.pingArrived(ping));
    }

    return game;
  }
  examinGame() {
    const game = Game.find({
      "observers.id": Meteor.userId()
    }).fetch();

    return game;
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
  clientMessages() {
    return ClientMessagesCollection.findOne(
      {
        to: Meteor.userId()
      },
      { sort: { createDate: -1, limit: 1 } }
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

  isAuthenticated() {
    return Meteor.userId() !== null;
  }

  componentWillUnmount() {
    this.state.subscription.css.stop();
    this.state.subscription.game.stop();
    this.state.subscription.gameRequests.stop();
    this.state.subscription.clientMessages.stop();
    this.state.subscribtion.observingGames.stop();
  }

  componentWillMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/sign-up");
    }
  }
  componentDidMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/home");
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
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

    let capturedSoldiers = history.reduce((accumulator, move) => {
      if ("captured" in move) {
        let piece = move.captured;
        let color = move.color === "w" ? "b" : "w";
        accumulator[color][piece] += 1;
        return accumulator;
      } else {
        return accumulator;
      }
    }, position);

    return capturedSoldiers;
  }
  drawCircle(square, color, size) {
    Meteor.call("drawCircle", "DrawCircle", this.gameId, square, color, size);
  }
  removeCircle(square) {
    Meteor.call("removeCircle", "RemoveCircle", this.gameId, square);
  }

  _pieceSquareDragStop = raf => {
    let game = this.renderGameMessages();
    if (!game) {
      let gameExamin = this.examinGame();
      if (!!gameExamin && gameExamin.length > 0) {
        game = gameExamin[gameExamin.length - 1];
      } else {
        return;
      }
    }

    Meteor.call("addGameMove", "gameMove", this.gameId, raf.move);
  };
  _boardFromMongoMessages(game) {
    let moves = [];
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
              moves.push(variation.movelist[variationI[0]].move);
            } else if (len > 1) {
              if (variation.movelist[variationI[len - 1]] !== undefined) {
                moves.push(variation.movelist[variationI[len - 1]].move);
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
    for (var index in moves) {
      this._boardfallensolder.move(moves[index]);
    }
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
  render() {
    const gameRequest = this.renderGameRequest();
    let game = this.renderGameMessages();
    let circles = [];
    let gameExamin = []; // this.examinGame();
    const systemCSS = this._systemCSS();
    const boardCSS = this._boardCSS();
    const clientMessage = this.clientMessages();
    if (
      systemCSS === undefined ||
      boardCSS === undefined ||
      systemCSS.length === 0 ||
      boardCSS.length === 0
    )
      return <div>Loading...</div>;
    const css = new CssManager(this._systemCSS(), this._boardCSS());
    if (!!game) {
      this.gameId = game._id;
      this._boardFromMongoMessages(game);
    } else {
      gameExamin = this.examinGame();
      if (!!gameExamin && gameExamin.length > 0) {
        game = gameExamin[gameExamin.length - 1];
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

    const capture = this._fallenSoldier();
    return (
      <div>
        <MainPage
          cssmanager={css}
          board={this._board}
          capture={capture}
          game={game}
          gameRequest={gameRequest}
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          onDrawCircle={this.drawCircle}
          onRemoveCircle={this.removeCircle}
          history={this.props.history}
          ref="main_page"
          examing={gameExamin}
          circles={circles}
          path={this.props.match.path}
        />
      </div>
    );
  }
}
