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
  });
});

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.userId = null;
    // You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this.player = {
      White: { name: "abc", rating: "123" },
      Black: { name: "xyz", rating: "456" }
    };
    this.userpending = null;
    this.state = {
      gameClock: null,
      from: null,
      to: null,
      subscription: {
        css: Meteor.subscribe("css"),
        game: Meteor.subscribe("playing_games"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages")
      },
      move: "",
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
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

  renderGameRequest() {
    return GameRequestCollection.findOne(
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
    } else {
      let result = null;
      let gameTurn = this._board.turn();
      if (this._board.game_over() === true) {
        alert("Game over");
        return false;
      }

      // TODO: FYI, I really prefer you use userid and not username when checking.
      //       The server uses user._id or Meteor.userId() exclusively.
      if (game.white.name === Meteor.user().username && gameTurn === "w") {
        result = this._board.move({ from: raf.from, to: raf.to });
      } else if (game.black.name === Meteor.user().username && gameTurn === "b") {
        result = this._board.move({ from: raf.from, to: raf.to });
      }
      var moveColor = "White";
      if (this._board.turn() === "b") {
        moveColor = "Black";
      }
      if (this._board.in_checkmate()) {
        // TODO: See, here we are already with overlooked non-internationalized strings
        let status = "Game over, " + moveColor + " is in checkmate.";
        alert(status);
      }

      if (result !== null) {
        let history = this._board.history();

        this.gameId = game._id;
        this.userId = Meteor.userId();
        let move = history[history.length - 1];
        Meteor.call("addGameMove", "gameMove", this.gameId, move);
        return true;
      }
    }
  };
  _boardFromMongoMessages(game) {
   /*  this._board = new Chess.Chess(game.fen);
    var history = this._board.history({verbose: true});
    log.debug("History",history); */
    this._board = new Chess.Chess();
    this._board.load(game.fen);
    var history = this._board.history({verbose: true});
    log.debug("History",history) 
}
  render() {
    const gameRequest = this.renderGameRequest();
    const game = this.renderGameMessages();
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
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          history={this.props.history}
          ref="main_page"
        />
      </div>
    );
  }
}
