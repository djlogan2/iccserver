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
const Game = new Mongo.Collection("game");
window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  log.error(errorMsg + "::" + url + "::" + lineNumber);
  return false;
};

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.userId=null;
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
        game: Meteor.subscribe("game")
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
    const game=Game.find({}, { sort: { startTime: -1 } }).fetch();
    log.debug("Game Collection  find", game);
    return game[0];
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
    this.state.subscription.game.stop();
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
       // accumulator[color].push(piece);
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
    if (!game){
        return null
    }else if(game.status ==="pending"){
        return false;
    }else{

    let result = null;
    let gameTurn = this._board.turn();
    if (this._board.game_over() === true) {
      alert("Game over");
      return false;
    }
    
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
      let status = "Game over, " + moveColor + " is in checkmate.";
      alert(status);
    }
    log.debug(
      "Game Turn" + gameTurn + " Move from " + raf.from + " to " + raf.to
    );
    if (result !== null) {
      let history = this._board.history();
      this.gameId = game._id;
      this.userId = Meteor.userId();
      let move = history[history.length - 1];
      Meteor.call("game.move", this.gameId, move);
      log.debug("insert new move in mongo" + move + " GameID" + this.gameId);
    }
  }
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
          log.error("How to updaate the game clock");
          break;

        case "error":
        default:
          log.error("realtime_message default", rec);
      }
    });
  }

  _boardFromMongoMessages(game) {
  
    this._board = new Chess.Chess();
    let moves=game.moves;
    let actions=game.actions;
     if (moves !== undefined) {
    
      // this._board.clear();
      for (let i = 0; i < moves.length; i++) {
        this._board.move(moves[i]);
      }
    }
     if(actions!=undefined && actions.length != null && actions.length > 0){
      let action = actions[actions.length - 1];
      /* if((action["type"] === "draw" && action["value"] === "accepted") ||  (action["type"] === "aborted" && action["value"] === "accepted") ||action["type"] === "resigned"){
       // this._board.reset();
      } */
    }
 
  }

  render() {
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
    log.debug(capture);
    log.trace(capture);
    log.info(capture);
   
    return (
      <div>
        <MainPage
          cssmanager={css}
          board={this._board}
          move={this.state.move}
          capture={capture}
          game={game}
          onDrop={this._pieceSquareDragStop}
        />
      </div>
    );
  }
}
