import React, { Component } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import Chess from "chess.js";
import { Link } from "react-router-dom";
import { Tracker } from "meteor/tracker";
import {
  ClientMessagesCollection,
  Game,
  Chat,
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/AppContainer");

let played_game_id;
let game_timestamp_client;

// Game.find().observe({
//   changed(newDocument) {
//     if (newDocument.status === "examining") {
//       return;
//     }

//     const color =
//       newDocument.white.id === Meteor.userId()
//         ? "white"
//         : newDocument.black.id === Meteor.userId()
//         ? "black"
//         : "?";
//     if (color === "?") return;

//     if (played_game_id !== newDocument._id) {
//       game_timestamp_client = new TimestampClient("client game", (_, msg) =>
//         Meteor.call("gamepong", newDocument._id, msg)
//       );
//       newDocument.lag[color].active.forEach(ping => game_timestamp_client.pingArrived(ping));
//     }
//   }
// });

// window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
//   // log.error(errorMsg + "::" + url + "::" + lineNumber);
//   return false;
// };

// Meteor.startup(() => {
//   Tracker.autorun(() => {
//     //
//     // This is in here so when the user navigates away from the page,
//     // the subscription is stopped on the server, cleaning up.
//     //
//     Meteor.subscribe("userData");
//     Meteor.subscribe("userData");
//     Meteor.subscribe("loggedOnUsers");
//     Meteor.subscribe("observing_games");
//   });
// });

class Examine extends Component {
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
      GameHistory: null,
      subscription: {
        css: Meteor.subscribe("css"),
        users: Meteor.subscribe("loggedOnUsers"),
        chats: Meteor.subscribe("chat"),
        //game: Meteor.subscribe("playing_games"),
        game: Meteor.subscribe("games"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages"),
        //observingGames: Meteor.subscribe("observing_games"),
        gameHistory: Meteor.subscribe("game_history"),
        importedGame: Meteor.subscribe("imported_games")
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.removeCircle = this.removeCircle.bind(this);
    this.gameHistoryload = this.gameHistoryload.bind(this);
    this.removeGameHistory = this.removeGameHistory.bind(this);
  }

  userRecord() {
    return mongoUser.find().fetch();
  }

  isAuthenticated() {
    return Meteor.userId() !== null;
  }

  componentWillUnmount() {
    if (this.state.subscription) {
      this.state.subscription.chats && this.state.subscription.chats.stop();
      this.state.subscription.css && this.state.subscription.css.stop();
      this.state.subscription.users && this.state.subscription.users.stop();
      this.state.subscription.game && this.state.subscription.game.stop();
      this.state.subscription.gameRequests && this.state.subscription.gameRequests.stop();
      this.state.subscription.clientMessages && this.state.subscription.clientMessages.stop();
      this.state.subscription.observingGames && this.state.subscription.observingGames.stop();
      this.state.subscription.gameHistory && this.state.subscription.gameHistory.stop();
      this.state.subscription.importedGame && this.state.subscription.importedGame.stop();
    }
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
    this.startExamine();
  }

  startExamine = () => {
    let examine_game = Game.find({ "observers.id": Meteor.userId() }).fetch();
    if (examine_game.length === 0) {
      this.initExamine();
    }
  };

  initExamine = () => {
    Meteor.call(
      "startLocalExaminedGame",
      "startlocalExaminedGame",
      "Mr white",
      "Mr black",
      0,
      (error, response) => {
        if (response) {
          // this.props.history.push('/examine');
          // this.props.examineAction(action);
        }
      }
    );
  };

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
    Meteor.call("addGameMove", "gameMove", this.gameId, raf.move);
  };

  handleObserveUser = userId => {
    Meteor.call("observeUser", "observeUser", userId, (err, result) => {
      if (err) {
        //
      }
    });
  };
  handleUnobserveUser = userId => {
    let that = this;
    Meteor.call("localUnobserveAllGames", "localUnobserveAllGames", userId, (err, result) => {
      if (err) {
      }
      that.initExamine();
    });

  }

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
    const gameRequest = this.props.game_request;
    let game = this.props.game_messages;
    let circles = [];
    //let actionlen;
    let gameExamin = [];

    const { systemCss, boardCss } = this.props;

    let clientMessage = null;
    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };
    if (
      systemCss === undefined ||
      boardCss === undefined ||
      systemCss.length === 0 ||
      boardCss.length === 0
    ) {
      return <Loading />;
    }

    const css = new CssManager(systemCss, boardCss);
    if (!!gameRequest) {
      this.gameId = gameRequest._id;
      this.message_identifier = "server:game:" + this.gameId;
    }
    if (!!game) {
      this.gameId = game._id;
      this.message_identifier = "server:game:" + this.gameId;
      //actionlen = game.actions.length;
      capture = this._boardFromMongoMessages(game);
    } else {
      gameExamin = this.props.examine_game;
      if (!!gameExamin && gameExamin.length > 0) {
        game = gameExamin[gameExamin.length - 1];
        //actionlen = game.actions ? game.actions.length : 0;
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

    if (this.props.examine_game.length === 0) {
      return <Loading />;
    }
    // const localUsers = Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
    // const list = Meteor.users.find({ "game.status": { $in: ["playing", "examining"] } }).fetch();
    // const allLisst =  Meteor.users.find().fetch();
    // console.log(localUsers, list, allLisst);
    return (
      <div className="examine">
        <ExaminePage
          userId={Meteor.userId()}
          user={this.props.user}
           cssManager={css}
          allUsers={this.props.all_users}
          board={this._board}
          gameId={this.props.examine_game[0]._id}
          observeUser={this.handleObserveUser}
          unObserveUser={this.handleUnobserveUser}
          // fen={this._board.fen()}
          capture={capture}
          //len={actionlen}
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
          examing={gameExamin}
          circles={circles}
        />
      </div>
    );
  }
}

export default withTracker(props => {
  return {
    examine_game: Game.find({ "observers.id": Meteor.userId() }).fetch(),
    // chats: Chat.find({"id": examine_game._id}),
    // chats: Chat.find({ type: { $in: ["kibitz", "whisper"] } }).fetch(),
    // chat: Chat.find({ "observers.id": Meteor.userId() }).fetch(),
    game_request: GameRequestCollection.findOne(
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
    ),
    // all_games2: Game.find().fetch(),
    all_games: Game.find({
      $or: [{ status: "playing" }, { status: "examining" }]
    }).fetch(),
    // all_users: Meteor.users.find({ "game.status": { $in: ["playing", "examining"] } }).fetch(),
    all_users: Meteor.users.find().fetch(),
    user: Meteor.users.findOne({ _id: Meteor.userId() }),
    game_messages: Game.findOne({
      $and: [
        { status: "playing" },
        {
          $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
        }
      ]
    }),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Examine);
