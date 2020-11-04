import React, { Component } from "react";
import PlayPage from "./components/PlayPage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import PlayModaler from "../pages/components/Modaler/PlayModaler";
import Chess from "chess.js";
import i18n from "meteor/universe:i18n";
import { ActionPopup } from "./components/Popup/Popup";
import {
  ClientMessagesCollection,
  Game,
  GameHistoryCollection,
  GameRequestCollection,
  ImportedGameCollection,
  LegacyUsersCollection,
  mongoCss,
  mongoUser
} from "../../api/client/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/Play_js");

let handleError = error => {
  if (error) {
    log.error("handleError", error);
  }
};

class PlayNotifier extends Component {
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
    // log.trace("PlayNotifier render", this.props);
    const translator = i18n.createTranslator("Common.MainPage", "en-US");

    if (!this.props.game || !this.props.game.pending) {
      return null;
    }

    const othercolor = Meteor.userId() === this.props.game.white.id ? "black" : "white";

    if (this.props.game.pending[othercolor].takeback.mid !== "0") {
      let moveCount =
        this.props.game.pending[othercolor].takeback.number === 1 ? "halfmove" : "fullmove";
      return this.renderActionPopup(translator(moveCount), "takeBack");
    } else if (this.props.game.pending[othercolor].draw !== "0") {
      return this.renderActionPopup(translator("draw"), "draw");
    } else if (this.props.game.pending[othercolor].adjourn !== "0") {
      return this.renderActionPopup("Adjourn", "adjourn");
    } else if (this.props.game.pending[othercolor].abort !== "0") {
      return this.renderActionPopup(translator("abort"), "abort");
    }
    return null;
  }
}

class Play extends Component {
  constructor(props) {
    super(props);
    // log.trace("Play constructor", props);
    this.userId = null;
    // You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;
    this.state = {
      gameUserId: null,
      gameType: null,
      gameData: null,
      GameHistory: null
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

  componentWillMount() {
    if (!Meteor.userId()) {
      this.props.history.push("/login");
    }
  }

  componentDidMount() {
    if (!Meteor.userId()) {
      this.props.history.push("/login");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!Meteor.userId()) {
      this.props.history.push("/login");
    }
  }

  logout(e) {
    e.preventDefault();
    Meteor.logout(err => {
      if (err) {
        log.error("logout error", err.reason);
      } else {
        this.props.history.push("/login");
      }
    });
    this.props.history.push("/login");
  }

  drawCircle(square, color, size) {
    Meteor.call(
      "drawCircle",
      "DrawCircle",
      this.props.in_game._id,
      square,
      color,
      size,
      handleError
    );
  }

  removeCircle(square) {
    Meteor.call("removeCircle", "RemoveCircle", this.props.in_game._id, square, handleError);
  }

  _pieceSquareDragStop = raf => {
    log.debug("_pieceSquareDragStop", [this.props.in_game._id, raf.move]);
    Meteor.call("addGameMove", "gameMove", this.props.in_game._id, raf.move, handleError);
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
    //logger.debug("_boardFromMongoMessages", game);
    if (!game.fen) {
      return;
    }
    let variation = game.variations;
    this._board.load(game.fen);
    this._boardfallensolder = new Chess.Chess();
    let itemToBeRemoved = [];

    for (let i = 0; i < variation.cmi; i++) {
      if (itemToBeRemoved.indexOf(i) === -1) {
        const moveListItem = variation.movelist[i];
        if (moveListItem !== undefined) {
          const variationI = moveListItem.variations;
          if (variationI !== undefined) {
            const len = variationI.length;
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
    const history = this._boardfallensolder.history({ verbose: true });
    const position = {
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

  handleExamine = () => {
    debugger;
    this.props.history.push("/examine");
  };

  getCoordinatesToRank(square) {
    let file = square.square.charAt(0);
    let rank = parseInt(square.square.charAt(1));
    const fileNumber = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let fileNo = fileNumber.indexOf(file);
    return { rank: rank - 1, file: fileNo, lineWidth: square.size, color: square.color };
  }

  clientMessages(id) {
    return ClientMessagesCollection.findOne({ client_identifier: id });
  }

  genOptions = gameData => {
    let friendId = Meteor.userId() === gameData.white.id ? gameData.black.id : gameData.white.id;

    let color = Meteor.userId() === gameData.white.id ? "white" : "black";
    let initial = gameData.clocks.white.initial;
    let incrementOrDelay = gameData.clocks.white.inc_or_delay;
    let incrementOrDelayType = gameData.clocks.white.delaytype;

    let options = { color, initial, incrementOrDelayType, incrementOrDelay };
    return { friendId, options };
  };

  handleRematch = () => {
    if (this.state.gameType === "startBotGame") {
      let {
        wild_number,
        rating_type,
        white_initial,
        white_increment_or_delay,
        white_increment_or_delay_type,
        black_initial,
        black_increment_or_delay,
        black_increment_or_delay_type,
        skill_level,
        color
      } = this.state.gameData;
      this.handleBotPlay(
        wild_number,
        rating_type,
        white_initial,
        white_increment_or_delay,
        white_increment_or_delay_type,
        black_initial,
        black_increment_or_delay,
        black_increment_or_delay_type,
        skill_level,
        color
      );
    } else {
      this.initFriendRematch();
    }
  };

  initFriendRematch = () => {
    let game = this.props.in_game;
    let newMatchData = this.genOptions(game);
    this.handleChooseFriend(newMatchData);
  };

  handleChooseFriend = ({ friendId, options }) => {
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

    let { color, initial, incrementOrDelayType, incrementOrDelay } = options;

    this.setState({ gameType: "addLocalMatchRequest", gameData: null, gameUserId: friendId });

    //TEMP - BAD SOLUTION - BAD!
    let stupidstupidstupid;
    const sigh = initial + (2 * incrementOrDelay) / 3;
    if (sigh >= 15) stupidstupidstupid = "standard";
    else if (sigh >= 3) stupidstupidstupid = "blitz";
    else stupidstupidstupid = "bullet";
    //TEMP - BAD SOLUTION - BAD!

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      friendId,
      defaultData.wild_number,
      stupidstupidstupid,
      defaultData.rated,
      defaultData.is_adjourned,
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      color,
      handleError
    );
  };

  handleBotPlay = (
    wild_number,
    rating_type,
    white_initial,
    white_increment_or_delay,
    white_increment_or_delay_type,
    black_initial,
    black_increment_or_delay,
    black_increment_or_delay_type,
    skill_level,
    color
  ) => {
    let data = {
      wild_number,
      rating_type,
      white_initial,
      white_increment_or_delay,
      white_increment_or_delay_type,
      black_initial,
      black_increment_or_delay,
      black_increment_or_delay_type,
      skill_level,
      color
    };

    let that = this;

    Meteor.call(
      "startBotGame",
      "play_computer",
      wild_number,
      rating_type,
      white_initial,
      white_increment_or_delay,
      white_increment_or_delay_type,
      black_initial,
      black_increment_or_delay,
      black_increment_or_delay_type,
      skill_level,
      color,
      err => {
        if (err) {
          debugger;
        }
        that.setState({ gameType: "startBotGame", gameData: data, gameUserId: null });
      }
    );
    // this.setState({ status: "playing" });
  };

  render() {
    // log.trace("Play render", this.props);

    if (!this.props.isready) {
      log.error("Play LOADING");
      return <Loading />;
    }

    const { systemCss, boardCss } = this.props;

    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    const css = new CssManager(systemCss, boardCss);
    if (!!this.props.game_request)
      this.message_identifier = "server:game:" + this.props.game_request._id;
    if (this.props.in_game) {
      this.message_identifier = "server:game:" + this.props.in_game._id;
      capture = this._boardFromMongoMessages(this.props.in_game);
    }

    let opponentName;
    let opponentId;
    let userColor;
    let result;
    let status2;
    const gamemessage = this.clientMessages(this.message_identifier);
    const visible =
      !!gamemessage && !!this.props.in_game && this.props.in_game.status === "examining";
    if (visible) {
      result = this.props.in_game.result;
      status2 = this.props.in_game.status2;
      userColor =
        this.props.in_game.white.name === !!Meteor.user() && Meteor.user().username
          ? "white"
          : "black";
      if (userColor === undefined) {
        debugger;
      }

      opponentName =
        userColor === "white" ? this.props.in_game.black.name : this.props.in_game.white.name;
      opponentId =
        userColor === "white" ? this.props.in_game.black._id : this.props.in_game.white._id;
    }

    return (
      <div className="examine">
        <PlayModaler
          userColor={userColor}
          visible={visible}
          userName={!!Meteor.userId() ? Meteor.user().username : "Logged Out"}
          gameResult={result}
          gameStatus2={status2}
          clientMessage={gamemessage}
          opponentName={opponentName}
          opponentId={opponentId}
          onRematch={this.handleRematch}
          onExamine={this.handleExamine}
        />

        <PlayNotifier game={this.props.in_game} userId={Meteor.userId()} cssManager={css} />
        <PlayPage
          cssManager={css}
          board={this._board}
          usersToPlayWith={this.props.usersToPlayWith}
          onChooseFriend={this.handleChooseFriend}
          onBotPlay={this.handleBotPlay}
          capture={capture}
          game={this.props.in_game}
          gameHistoryload={this.gameHistoryload}
          GameHistory={this.state.GameHistory}
          removeGameHistory={this.removeGameHistory}
          gameRequest={this.props.game_request}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          onRemoveCircle={this.removeCircle}
          ref="main_page"
        />
      </div>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    css: Meteor.subscribe("css"),
    game: Meteor.subscribe("games"),
    chats: Meteor.subscribe("chat"),
    child_chat_texts: Meteor.subscribe("child_chat_texts"),
    users: Meteor.subscribe("loggedOnUsers"),
    userData: Meteor.subscribe("userData"),
    gameRequests: Meteor.subscribe("game_requests"),
    clientMessages: Meteor.subscribe("client_messages"),
    gameHistory: Meteor.subscribe("game_history"),
    importedGame: Meteor.subscribe("imported_games")
  };

  function isready() {
    for (const k in subscriptions)
      if (!subscriptions[k].ready()) {
        log.error("Play render, " + k + " subscription is not ready");
        return false;
      }
    return true;
  }

  const PLAYING_SELECTOR = {
    $and: [
      { status: "playing" },
      { $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }] }
    ]
  };
  const EXAMINING_SELECTOR = {
    $and: [
      { status: "examining" },
      { $or: [{ "observers.id": Meteor.userId() }, { owner: Meteor.userId() }] }
    ]
  };
  return {
    isready: isready(),
    usersToPlayWith: Meteor.users
      .find({ $and: [{ _id: { $ne: Meteor.userId() } }, { "status.game": { $ne: "playing" } }] })
      .fetch(),
    in_game: Game.findOne({ $or: [PLAYING_SELECTOR, EXAMINING_SELECTOR] }),
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
    client_messages: ClientMessagesCollection.find().fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Play);

const game_timestamps = {};
Game.find({ status: "playing" }).observeChanges({
  added(id, game) {
    log.debug("timstamp observer added, id=" + id);
    let color;
    if (game.white.id === Meteor.userId()) color = "white";
    else if (game.black.id === Meteor.userId()) color = "black";
    if (!color) throw new Meteor.Error("Unable to discern which color we are");
    game_timestamps[id] = {
      color: color,
      timestamp: new TimestampClient(new Logger("client/play/timestamp"), "client game", (_, msg) =>
        Meteor.call("gamepong", id, msg)
      )
    };
  },
  changed(id, fields) {
    if (fields.status && fields.status !== "playing") {
      log.debug("timstamp observer changed, no longer playing id=" + id);
      if (!!game_timestamps[id]) {
        game_timestamps[id].timestamp.end();
        delete game_timestamps[id];
      }
    } else if (fields.lag) {
      if (!game_timestamps[id]) {
        log.error("Unable to find timestamp for played game", id);
        return;
      }
      fields.lag[game_timestamps[id].color].active.forEach(ping =>
        game_timestamps[id].timestamp.pingArrived(ping)
      );
    }
  },
  removed(id) {
    log.debug("timstamp observer removed, id=" + id);
    if (!!game_timestamps[id]) {
      try {
        game_timestamps[id].timestamp.end();
      } catch (e) {
        log.error("observeChanges removed error", e);
      } finally {
        delete game_timestamps[id];
      }
    }
  }
});
