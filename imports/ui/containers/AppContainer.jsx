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

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  log.error(errorMsg + "::" + url + "::" + lineNumber);
  return false;
};

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this._rm_index = 0;
    this.player = {
      White: { name: "abc", rating: "123" },
      Black: { name: "xyz", rating: "456" }
    };
    this.state = {
      subscription: {
        css: Meteor.subscribe("css"),
        user: Meteor.subscribe("userData"),
        realtime: Meteor.subscribe("realtime_messages")
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
    log.debug("Fetched " + records.length + " records from realtime_messages", {
      records: records
    });
    return records;
  }

  componentWillUnmount() {
    this.state.subscription.css.stop();
    this.state.subscription.user.stop();
    this.state.subscription.realtime.stop();
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
          this._board = new Chess.Chess();
          this.player.Black = rec.message.black;
          this.player.White = rec.message.white;
          console.log(
            "game start: white-" +
              rec.message.black.name +
              " black-" +
              rec.message.white.name
          );
          // this.setState(prevState => {
          //   let player = Object.assign({}, prevState.player);
          //   player.White = rec.message.white;
          //   player.Black = rec.message.black;
          //   return { player };
          // });
          // console.log(
          //   "After game start: white-" +
          //     this.state.player.White.name +
          //     " black-" +
          //     rec.message.white.name
          // );
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
          console.log(
            "game move: white-" +
              this.state.player.White.name +
              " black-" +
              this.state.player.Black.name
          );
          console.log("move " + this.state.move);
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

  render() {
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
    this._boardFromMessages(this._legacyMessages());
    //
    return (
      <div>
        <MainPage
          cssmanager={css}
          board={this._board}
          move={this.state.move}
          player={this.state.player}
        />
      </div>
    );
  }
}
