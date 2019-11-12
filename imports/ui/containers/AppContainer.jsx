import React from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Chess from "chess.js";
import { Tracker } from "meteor/tracker";

const log = new Logger("client/AppContainer");
const mongoCss = new Mongo.Collection("css");
const mongoUser = new Mongo.Collection("userData");
const Game = new Mongo.Collection("game");
const GameRequestCollection = new Mongo.Collection("game_requests");

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
  });
});

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.userId = null;
    this._board = new Chess.Chess();
    this.player = {
      White: { name: "abc", rating: "123" },
      Black: { name: "xyz", rating: "456" }
    };
    this.state = {
      gameClock: null,
      from: null,
      to: null,
      subscription: {
        css: Meteor.subscribe("css"),
        game: Meteor.subscribe("game"),
        gameRequests: Meteor.subscribe("game_requests")
      },
      move: "",
      player: {
        White: { name: "abc", rating: "123" },
        Black: { name: "xyz", rating: "456" }
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
  }

  renderGameMessages() {
    const game = Game.findOne({
      $and: [
        { status: "playing" },
        {
          $or: [
            { "white.id": Meteor.userId() },
            { "black.id": Meteor.userId() }
          ]
        }
      ]
    });
    return game;
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
  }

  componentWillMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/sign-up");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
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
    let history = this._board.history({ verbose: true });
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

  _pieceSquareDragStop = raf => {
    const game = this.renderGameMessages();

    if (!game) {
      return false;
    } else if (game.status === "pending") {
      return false;
    } else {
      let result = null;
      let gameTurn = this._board.turn();
      if (this._board.game_over() === true) {
        alert("Game over");
        return false;
      }

      if (game.white.name === Meteor.user().username && gameTurn === "w") {
        result = this._board.move({ from: raf.from, to: raf.to });
      } else if (
        game.black.name === Meteor.user().username &&
        gameTurn === "b"
      ) {
        result = this._board.move({ from: raf.from, to: raf.to });
      }
      var moveColor = "White";
      if (this._board.turn() === "b") {
        moveColor = "Black";
      }
      if (this._board.in_checkmate()) {
        let status = "Game over, " + moveColor + " is in checkmate.";
        alert(status);
      }

      if (result !== null) {
        let history = this._board.history();

        this.gameId = game._id;
        this.userId = Meteor.userId();
        let move = history[history.length - 1];
        log.debug("Move pass from appcontainer", move);
        Meteor.call("addGameMove", "addmove", this.gameId, move);
        return true;
      }
    }
  };

  _boardFromMongoMessages(game) {
    //log.debug("Game", game);
    this._board = new Chess.Chess();
    let moves = game.actions;
    let clocks = game.clocks;
    if (moves !== undefined) {
      for (var move of moves) {
        this._board.move(move["parameter"]);
      }
    }
    if (clocks !== undefined) {
      game.clocks.white = clocks.white;
      game.clocks.black = clocks.black;
    }
  }

  render() {
    // const gameRequest = GameRequestCollection.find({}).fetch()[0];
    const gameRequest = GameRequestCollection.findOne(
      {
        $or: [
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

    const game = this.renderGameMessages();

    const systemCSS = this._systemCSS();
    const boardCSS = this._boardCSS();

    if (
      systemCSS === undefined ||
      boardCSS === undefined ||
      systemCSS.length === 0 ||
      boardCSS.length === 0
    )
      return <div>Loading...</div>;
    const css = new CssManager(this._systemCSS(), this._boardCSS());
    if (game !== undefined) {
      this._boardFromMongoMessages(game);
    }

    const capture = this._fallenSoldier();
    return (
      <div>
        <MainPage
          cssmanager={css}
          board={this._board}
          move={this.state.move}
          capture={capture}
          game={game}
          gameRequest={gameRequest}
          onDrop={this._pieceSquareDragStop}
          ref="main_page"
        />
      </div>
    );
  }
}
