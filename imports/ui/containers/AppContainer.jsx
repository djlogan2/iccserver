import React from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Logger, SetupLogger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Chess from "chess.js";
const log = new Logger("client/AppContainer");
const mongoCss = new Mongo.Collection("css");
const mongoUser = new Mongo.Collection("userData");
const realtime_messages = new Mongo.Collection("realtime_messages");
const Game = new Mongo.Collection("game-messages");
window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  log.error(errorMsg + "::" + url + "::" + lineNumber);
  return false;
};

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.gameId = null;
    this._board = new Chess.Chess();
    this._rm_index = 0;
    this.player = {
      White: { name: "abc", rating: "123" },
      Black: { name: "xyz", rating: "456" }
    };
    this.state = {
      from: null,
      to: null,
      subscription: {
        css: Meteor.subscribe("css"),
        realtime: Meteor.subscribe("realtime_messages"),
        loggedOnUsers: Meteor.subscribe("loggedOnUsers"),
        gameMessages: Meteor.subscribe("game")
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
    const game = Game.findOne({}, { _id: { $slice: -1 } });
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

  _legacyMessages() {
    const records = realtime_messages
      .find({ nid: { $gt: this._rm_index } }, { sort: { nid: 1 } })
      .fetch();

    return records;
  }

  componentWillUnmount() {
    this.state.subscription.css.stop();
    this.state.subscription.realtime.stop();
    this.state.subscription.loggedOnUsers.stop();
    this.state.subscription.gameMessages.stop();
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
  _pieceSquareDragStop = raf => {
    //console.log(raf);
    //  Meteor.call("game-move.insert", raf.to, this.gameId);
    this.setState({ from: raf.from, to: raf.to });
  };
  _boardFromMessages(legacymessages) {
    if (legacymessages.length)
      this._rm_index = legacymessages[legacymessages.length - 1].nid;
    legacymessages.forEach(rec => {
      log.debug("realtime_record", rec);
      this._rm_index = rec.nid;
      switch (rec.type) {
        case "setup_logger":
          SetupLogger.addLoggers(rec.message);
          break;

        case "game_start":
          //  this._board = new Chess.Chess();
          this.player.Black = rec.message.black;
          this.player.White = rec.message.white;

          break;

        case "game_move":
          if (!this._board) this._board = new Chess.Chess();
          this._board.move(rec.message.algebraic);
          this.setState({
            move: rec.message.algebraic
          });
          this.setState(prevState => {
            let player = Object.assign({}, prevState.player);
            player.White = this.player.White;
            player.Black = this.player.Black;
            return { player };
          });

          break;

        case "update_game_clock":
          break;

        case "error":
        default:
          log.error("realtime_message default", rec);
      }
    });
  }

  _boardFromMongoMessages(moves) {
    if (moves != undefined) {
      let move = moves[moves.length - 1];
      console.log("Move", move);
      if (!this._board) this._board = new Chess.Chess();
      this._board.move(move);
    }
  }

  render() {
    const players = this.renderGameMessages();
    if (this.state.from != null && this.state.to != null) {
      this._board.move({ from: this.state.from, to: this.state.to });
      console.log("test", this._board.history());
      let history = this._board.history();
      if (players != undefined) {
        this.gameId = players._id;
        let move = history[history.length - 1];
        let mongoMove = players.moves[players.moves.length - 1];
        if (move !== mongoMove) {
          Meteor.call("game-move.insert", move, this.gameId);
        }
      //  this._boardFromMongoMessages(players.moves);
      }
    }
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
     if (players != undefined) {
     this._boardFromMongoMessages(players.moves);
     }

    return (
      <div>
        <MainPage
          cssmanager={css}
          board={this._board}
          move={this.state.move}
          player={players}
          onDrop={this._pieceSquareDragStop}
        />
      </div>
    );
  }
}
