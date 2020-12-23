import React, { Component } from "react";
import PlayPage from "../components/PlayPage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../../lib/client/Logger";
import CssManager from "../components/Css/CssManager";
import Loading from "../components/Loading";
import PlayModaler from "../components/Modaler/PlayModaler";
import Chess from "../../../../node_modules/chess.js/chess";
import {
  ClientMessagesCollection,
  DynamicRatingsCollection,
  Game,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../../api/client/collections";
import { TimestampClient } from "../../../../lib/Timestamp";
import { findRatingObject } from "../../../../lib/ratinghelpers";
import { isReadySubscriptions } from "../../../utils/utils";
import { compose } from "redux";
import { withPlayNotifier } from "../../HOCs/withPlayNotifier";
import injectSheet from "react-jss";
import { dynamicPlayNotifierStyles } from "./dynamicPlayNotifierStyles";
import { RESOURCE_EXAMINE, RESOURCE_LOGIN } from "../../../constants/resourceConstants";

const log = new Logger("client/Play_js");

let handleError = error => {
  if (error) {
    log.error("handleError", error);
  }
};

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
      gameType: null,
      gameData: null
    };
  }

  userRecord() {
    return mongoUser.find().fetch();
  }

  componentDidMount() {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  drawCircle = (square, color, size) => {
    const { inGame } = this.props;

    Meteor.call("drawCircle", "DrawCircle", inGame._id, square, color, size, handleError);
  };

  removeCircle = square => {
    const { inGame } = this.props;

    Meteor.call("removeCircle", "RemoveCircle", inGame._id, square, handleError);
  };

  _pieceSquareDragStop = raf => {
    const { inGame } = this.props;

    Meteor.call("addGameMove", "gameMove", inGame._id, raf.move, handleError);
  };

  _boardFromMongoMessages = game => {
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
        if (moveListItem) {
          const variationI = moveListItem.variations;
          if (variationI) {
            const len = variationI.length;
            if (len === 1 && variation.movelist[variationI[0]]) {
              this._boardfallensolder.move(variation.movelist[variationI[0]].move);
            } else if (len > 1) {
              if (variation.movelist[variationI[len - 1]]) {
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
        const color = move.color === "w" ? "b" : "w";
        accumulator[color][move.captured] += 1;
      }

      return accumulator;
    }, position);
  };

  handleExamine = () => {
    const { history } = this.props;

    history.push(RESOURCE_EXAMINE);
  };

  getCoordinatesToRank(square) {
    const file = square.square.charAt(0);
    const rank = parseInt(square.square.charAt(1));
    const fileNumber = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const fileNo = fileNumber.indexOf(file);

    return { rank: rank - 1, file: fileNo, lineWidth: square.size, color: square.color };
  }

  clientMessages(id) {
    return ClientMessagesCollection.findOne({ client_identifier: id });
  }

  genOptions = gameData => {
    const friendId = Meteor.userId() === gameData.white.id ? gameData.black.id : gameData.white.id;

    const color = Meteor.userId() === gameData.white.id ? "white" : "black";
    const initial = gameData.clocks.white.initial;
    const incrementOrDelay = gameData.clocks.white.inc_or_delay;
    const incrementOrDelayType = gameData.clocks.white.delaytype;

    const options = { color, initial, incrementOrDelayType, incrementOrDelay };
    return { friendId, options };
  };

  handleRematch = () => {
    const { gameType, gameData } = this.state;

    if (gameType === "startBotGame") {
      const {
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
      } = gameData;
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
    const { inGame } = this.props;

    const newMatchData = this.genOptions(inGame);
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

    const { color, initial, incrementOrDelayType, incrementOrDelay } = options;

    const rating_object = findRatingObject(
      0,
      "white",
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      DynamicRatingsCollection.find({ wild_number: 0 }).fetch()
    );

    if (!rating_object) throw new Meteor.Error("Unable to find a rating type");

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      friendId,
      defaultData.wild_number,
      rating_object.rating_type,
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

  handleBotPlay = gameData => {
    const {
      wildNumber,
      ratingType,
      whiteInitial,
      whiteIncrementOrDelay,
      whiteIncrementOrDelayType,
      blackInitial,
      blackIncrementOrDelay,
      blackIncrementOrDelayType,
      skillLevel,
      color
    } = gameData;

    Meteor.call(
      "startBotGame",
      "play_computer",
      wildNumber,
      ratingType,
      whiteInitial,
      whiteIncrementOrDelay,
      whiteIncrementOrDelayType,
      blackInitial,
      blackIncrementOrDelay,
      blackIncrementOrDelayType,
      skillLevel,
      color
    );
    this.setState({ gameData });
  };

  render() {
    const { isReady, gameRequest, inGame, usersToPlayWith } = this.props;

    if (!isReady) {
      return <Loading />;
    }

    const { systemCss, boardCss } = this.props;

    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    const css = new CssManager(systemCss, boardCss);
    if (!!gameRequest) {
      this.message_identifier = "server:game:" + gameRequest._id;
    }

    if (inGame) {
      this.message_identifier = "server:game:" + inGame._id;
      capture = this._boardFromMongoMessages(inGame);
    }

    let opponentName;
    let userColor;
    let result;

    const gamemessage = this.clientMessages(this.message_identifier);
    const visible = !!gamemessage && !!inGame && inGame.status === "examining";
    if (visible) {
      result = inGame.result;
      userColor =
        inGame.white.name === !!Meteor.user() && Meteor.user().username ? "white" : "black";

      if (!userColor) {
        log.error("userColor is missing");
      }

      opponentName = userColor === "white" ? inGame.black.name : inGame.white.name;
    }

    return (
      <div className="examine">
        <PlayModaler
          visible={visible}
          gameResult={result}
          clientMessage={gamemessage}
          opponentName={opponentName}
          userName={!!Meteor.userId() ? Meteor.user().username : "Logged Out"}
          onRematch={this.handleRematch}
          onExamine={this.handleExamine}
        />
        <PlayPage
          cssManager={css}
          capture={capture}
          game={inGame}
          usersToPlayWith={usersToPlayWith}
          board={this._board}
          onChooseFriend={this.handleChooseFriend}
          onBotPlay={this.handleBotPlay}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          onRemoveCircle={this.removeCircle}
          ref="main_page"
        />
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    const subscriptions = {
      game: Meteor.subscribe("games"),
      chats: Meteor.subscribe("chat"),
      child_chat_texts: Meteor.subscribe("child_chat_texts"),
      users: Meteor.subscribe("loggedOnUsers"),
      userData: Meteor.subscribe("userData"),
      clientMessages: Meteor.subscribe("client_messages"),
      importedGame: Meteor.subscribe("imported_games"),
      dynamic_ratings: Meteor.subscribe("DynamicRatings")
    };

    return {
      isReady: isReadySubscriptions(subscriptions),

      usersToPlayWith: Meteor.users
        .find({ $and: [{ _id: { $ne: Meteor.userId() } }, { "status.game": { $ne: "playing" } }] })
        .fetch(),

      inGame: Game.findOne({
        $or: [
          {
            $and: [
              { status: "playing" },
              { $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }] }
            ]
          },
          {
            $and: [
              { status: "examining" },
              { $or: [{ "observers.id": Meteor.userId() }, { owner: Meteor.userId() }] }
            ]
          }
        ]
      }),

      gameRequest: GameRequestCollection.findOne(
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

      systemCss: mongoCss.findOne({ type: "system" }),
      boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] }),
      playNotificationsCss: mongoCss.findOne({ type: "playNotifications" })
    };
  }),
  injectSheet(dynamicPlayNotifierStyles),
  withPlayNotifier
)(Play);

const game_timestamps = {};
Game.find({ status: "playing" }).observeChanges({
  added(id, game) {
    //  log.debug("timstamp observer added, id=" + id);
    let color;
    if (game.white.id === Meteor.userId()) color = "white";
    else if (game.black.id === Meteor.userId()) color = "black";
    if (!color) throw new Meteor.Error("Unable to discern which color we are");
    game_timestamps[id] = {
      color,
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
