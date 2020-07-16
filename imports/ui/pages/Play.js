import React, { Component } from "react";
import PlayPage from "./components/PlayPage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Modal, Button } from "antd";
import { Logger } from "../../../lib/client/Logger";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import PlayModaler from "../pages/components/Modaler/PlayModaler";
import Chess from "chess.js";
import { Link } from "react-router-dom";
import i18n from "meteor/universe:i18n";
import { ActionPopup } from "./components/Popup/Popup";
import {
  ClientMessagesCollection,
  Game,
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const logger = new Logger("client/AppContainer");

let handleError = error => {
  if (error) {
    logger(error);
  }
};
class PlayNotifier extends Component {
  constructor() {
    super();
  }

  renderActionPopup = (title, action) => {
    return (
      <ActionPopup
        gameID={this.props.game._id}
        title={title}
        action={action}
        cssManager={this.props.cssManager}
      />
    );
  };

  render() {
    const translator = i18n.createTranslator("Common.MainPage", "en-US");
    if (!this.props.game) {
      return null;
    }
    if (this.props.game.actions === undefined || this.props.game.actions.length === 0) {
      return null;
    }

    const { game, userId } = this.props;
    const { actions } = game;

    let actionPopup = null;
    const othercolor = this.props.userId === this.props.game.white.id ? "black" : "white";

    for (const action of actions) {
      const issuer = action["issuer"];
      switch (action["type"]) {
        case "takeback_requested":
          if (
            issuer !== this.userId &&
            (!!game.pending && game.pending[othercolor].takeback.number > 0)
          ) {
            let moveCount =
              game.pending[othercolor].takeback.number === 1 ? "halfmove" : "fullmove";
            actionPopup = this.renderActionPopup(translator(moveCount), "takeBack");
          }
          break;
        case "draw_requested":
          if (issuer !== userId && (!!game.pending && game.pending[othercolor].draw !== "0")) {
            actionPopup = this.renderActionPopup(translator("draw"), "draw");
          }
          break;
        case "adjourn_requested":
          if (issuer !== userId && (!!game.pending && game.pending[othercolor].adjourn !== "0")) {
            actionPopup = this.renderActionPopup("Adjourn", "adjourn");
          }
          break;
        case "abort_requested":
          if (issuer !== userId && (!!game.pending && game.pending[othercolor].abort !== "0")) {
            actionPopup = this.renderActionPopup(translator("abort"), "abort");
          }
          break;
        default:
          break;
      }
    }
    return actionPopup;
  }
}

class Play extends Component {
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
        //game: Meteor.subscribe("playing_games"),
        game: Meteor.subscribe("games"),
        chats: Meteor.subscribe("chat"),
        users: Meteor.subscribe("loggedOnUsers"),
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
      this.state.subscription.css && this.state.subscription.css.stop();
      this.state.subscription.chats && this.state.subscription.chats.stop();
      this.state.subscription.game && this.state.subscription.game.stop();
      this.state.subscription.users && this.state.subscription.users.stop();
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
    // this.startExamine();
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
    Meteor.call("drawCircle", "DrawCircle", this.gameId, square, color, size, handleError);
  }

  removeCircle(square) {
    Meteor.call("removeCircle", "RemoveCircle", this.gameId, square, handleError);
  }

  _pieceSquareDragStop = raf => {
    Meteor.call("addGameMove", "gameMove", this.gameId, raf.move, handleError);
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

  handleChooseFriend = userId => {
    const defaultData = {
      user: null,
      userId: null,
      wild_number: 0,
      rating_type: "standard",
      rated: true,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: null
    };

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      userId,
      defaultData.wild_number,
      defaultData.rating_type,
      defaultData.rated,
      defaultData.is_adjourned,
      defaultData.time,
      defaultData.inc,
      defaultData.incOrdelayType,
      defaultData.time,
      defaultData.inc,
      defaultData.incOrdelayType,
      defaultData.color,
      handleError
    );
  };

  render() {
    const gameRequest = this.props.game_request;
    let game = this.props.game_playing;
    let circles = [];
    //let actionlen;
    let gameExamin = [];

    let { isWhiteCheckmated, isBlackCheckmated, isWhiteStalemated, isBlackStalemated } = this.props;

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

    if (game) {
      this.gameId = game._id;
      this.message_identifier = "server:game:" + this.gameId;
      //actionlen = game.actions.length;
      capture = this._boardFromMongoMessages(game);
    }

    if (!!this.gameId) {
      clientMessage = this.clientMessages(this.message_identifier);
    }

    // if (!game) {
    //   return <Loading />;
    // }
    let opponentName;
    let userColor;
    if (this.props.game_playing) {
      userColor =
        this.props.game_playing.white.name === this.props.user.username ? "white" : "black";
      opponentName =
        userColor === "white"
          ? this.props.game_playing.black.name
          : this.props.game_playing.white.name;
    }

    return (
      <div className="examine">
        <PlayModaler
          userColor={userColor}
          userName={this.props.user && this.props.user.username}
          opponentName={opponentName}
          onRematch={this.handleChooseFriend}
          isWhiteCheckmated={isWhiteCheckmated}
          isBlackCheckmated={isBlackCheckmated}
          isWhiteStalemated={isWhiteStalemated}
          isBlackStalemated={isBlackStalemated}
        />
        <PlayNotifier game={this.props.game_playing} userId={Meteor.userId()} cssManager={css} />
        <PlayPage
          userId={Meteor.userId()}
          cssManager={css}
          board={this._board}
          gameId={this.gameId}
          usersToPlayWith={this.props.usersToPlayWith}
          onChooseFriend={this.handleChooseFriend}
          // fen={this._board.fen()}
          capture={capture}
          //len={actionlen}
          game={game}
          user={this.props.user}
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
    user: Meteor.users.findOne({ _id: Meteor.userId() }),
    usersToPlayWith: Meteor.users
      .find({ $and: [{ _id: { $ne: Meteor.userId() } }, { "status.game": { $ne: "playing" } }] })
      .fetch(),
    examine_game: Game.find({ "observers.id": Meteor.userId() }).fetch(),
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
    game_playing: Game.findOne({
      $and: [
        { status: "playing" },
        {
          $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
        }
      ]
    }),
    client_messages: ClientMessagesCollection.find({ to: Meteor.userId() }).fetch(),
    isWhiteCheckmated:
      ClientMessagesCollection.find({ message: "White checkmated" }).fetch().length > 0,
    isBlackCheckmated:
      ClientMessagesCollection.find({ message: "Black checkmated" }).fetch().length > 0,
    isWhiteStalemated:
      ClientMessagesCollection.find({ message: "White stalemated" }).fetch().length > 0,
    isBlackStalemated:
      ClientMessagesCollection.find({ message: "Black stalemated" }).fetch().length > 0,
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Play);

const game_timestamps = {};
Game.find({ status: "playing" }).observeChanges({
  added(id, game) {
    let color;
    if (game.white.id === Meteor.userId()) color = "white";
    else if (game.black.id === Meteor.userId()) color = "black";
    if (!color) throw new Meteor.Error("Unable to discern which color we are");
    game_timestamps[id] = {
      color: color,
      timestamp: new TimestampClient("client game", (_, msg) => Meteor.call("gamepong", id, msg))
    };
  },
  changed(id, fields) {
    if (fields.status && fields.status !== "playing") {
      if (!!game_timestamps[id]) {
        game_timestamps[id].timestamp.end();
        delete game_timestamps[id];
      }
    } else if (fields.lag) {
      if (!game_timestamps[id]) throw new Meteor.Error("Unable to find timestamp for played game");
      fields.lag[game_timestamps[id].color].active.forEach(ping =>
        game_timestamps[id].timestamp.pingArrived(ping)
      );
    }
  },
  removed(id) {
    if (!!game_timestamps[id]) {
      game_timestamps[id].end();
      delete game_timestamps[id];
    }
  }
});
//    if (played_game_id !== newDocument._id) {
//       game_timestamp_client = new TimestampClient("client game", (_, msg) =>
//         Meteor.call("gamepong", newDocument._id, msg)
//       );
//       newDocument.lag[color].active.forEach(ping => game_timestamp_client.pingArrived(ping));
//     }
