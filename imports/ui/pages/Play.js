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
  mongoCss,
  mongoUser
} from "../../api/client/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const logger = new Logger("client/AppContainer");

const EXAMINING_QUOTE = {
  $or: [
    { "black.id": Meteor.userId() },
    { "white.id": Meteor.userId() },
    { "observers.id": Meteor.userId() },
    { owner: Meteor.userId() }
  ]
};

let handleError = error => {
  if (error) {
    logger.error(error);
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
      gameUserId: null,
      gameType: null,
      gameData: null,
      GameHistory: null,
      subscription: {
        css: Meteor.subscribe("css"),
        //game: Meteor.subscribe("playing_games"),
        game: Meteor.subscribe("games"),
        chats: Meteor.subscribe("chat"),
        i18n: Meteor.subscribe("i18n_front"),
        users: Meteor.subscribe("loggedOnUsers"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages"),
        //observingGames: Meteor.subscribe("observing_games"),
        gameHistory: Meteor.subscribe("game_history"),
        importedGame: Meteor.subscribe("imported_games")
      },
      isAuthenticated: Meteor.userId() !== null
      // test: false
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

    // setTimeout(() => {
    //   this.setState({test: true});
    // }, 60000)
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
        logger.error(err.reason);
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
    if (!game.fen) {
      return;
    }
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
    if (!!game && !!game.fen) this._board.load(game.fen);
  }

  handleExamine = gameId => {
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
    let friendId =
      this.props.user._id === gameData.white.id ? gameData.black.id : gameData.white.id;

    let color = this.props.user._id === gameData.white.id ? "white" : "black";
    let initial = gameData.clocks.white.initial;
    let incrementOrDelay = gameData.clocks.white.inc_or_delay;
    let incrementOrDelayType = gameData.clocks.white.delaytype;

    let options = { color, initial, incrementOrDelayType, incrementOrDelay };
    return { friendId, options };
  };

  handleRematch = gameId => {
    // Meteor.call(
    //   "rematchRequest",
    //   "rematchRequest",
    //   userId
    // );

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
    let game = this.props.examine_game[0];
    let newMatchData = this.genOptions(game);
    this.handleChooseFriend(newMatchData);
  };

  handleChooseFriend = ({ friendId, options }) => {
    // const defaultData = {
    //   user: null,
    //   userId: null,
    //   wild_number: 0,
    //   rating_type: "standard",
    //   rated: true,
    //   is_adjourned: false,
    //   time: 14,
    //   inc: 1,
    //   incOrdelayType: "inc",
    //   color: null
    // };

    // Meteor.call(
    //   "addLocalMatchRequest",
    //   "matchRequest",
    //   friendId,
    //   defaultData.wild_number,
    //   defaultData.rating_type,
    //   defaultData.rated,
    //   defaultData.is_adjourned,
    //   defaultData.time,
    //   defaultData.inc,
    //   defaultData.incOrdelayType,
    //   defaultData.time,
    //   defaultData.inc,
    //   defaultData.incOrdelayType,
    //   defaultData.color,
    //   handleError
    // );

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
      // defaultData.time,
      // defaultData.inc,
      // defaultData.incOrdelayType,
      // defaultData.time,
      // defaultData.inc,
      // defaultData.incOrdelayType,
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
    const gameRequest = this.props.game_request;
    let game = this.props.game_playing;

    if (this.props.user && this.props.user.status && this.props.user.status.game === "examining") {
      game = this.props.examine_game[0];
    }

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
    let opponentId;
    let userColor;
    let result;
    let status2;
    if (game) {
      result = game.result;
      status2 = game.status2;
      userColor = game.white.name === this.props.user.username ? "white" : "black";
      if (userColor === undefined) {
        debugger;
      }
      opponentName = userColor === "white" ? game.black.name : game.white.name;
      opponentId = userColor === "white" ? game.black._id : game.white._id;
    }

    return (
      <div className="examine">
        {this.state.subscription.clientMessages.ready() && (
          <PlayModaler
            userColor={userColor}
            // userColor={"white"}
            userName={this.props.user && this.props.user.username}
            gameId={this.gameId}
            gameResult={result}
            gameStatus2={status2}
            clientMessage={clientMessage}
            opponentName={opponentName}
            opponentId={opponentId}
            onRematch={this.handleRematch}
            onExamine={this.handleExamine}
          />
        )}

        <PlayNotifier game={this.props.game_playing} userId={Meteor.userId()} cssManager={css} />
        <PlayPage
          userId={Meteor.userId()}
          cssManager={css}
          board={this._board}
          gameId={this.gameId}
          usersToPlayWith={this.props.usersToPlayWith}
          onChooseFriend={this.handleChooseFriend}
          onBotPlay={this.handleBotPlay}
          capture={capture}
          game={game}
          user={this.props.user}
          gameHistoryload={this.gameHistoryload}
          GameHistory={this.state.GameHistory}
          removeGameHistory={this.removeGameHistory}
          gameRequest={gameRequest}
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          onRemoveCircle={this.removeCircle}
          ref="main_page"
          examing={[]}
          circles={[]}
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
    examine_game: Game.find(EXAMINING_QUOTE).fetch(),
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
    client_messages: ClientMessagesCollection.find().fetch(),
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
      timestamp: new TimestampClient(new Logger("play/client/timestamp"), "client game", (_, msg) =>
        Meteor.call("gamepong", id, msg)
      )
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
      try {
        game_timestamps[id].timestamp.end();
      } catch (e) {
        logger.error(e);
      } finally {
        delete game_timestamps[id];
      }
    }
  }
});
