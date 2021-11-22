import Chess from "chess.js";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { compose } from "redux";
import {
  ClientMessagesCollection,
  DynamicRatingsCollection,
  Game,
  GameRequestCollection,
  mongoCss,
} from "../../../../imports/api/client/collections";
import { Logger } from "../../../../lib/client/Logger";
import { findRatingObject } from "../../../../lib/ratinghelpers";
import { TimestampClient } from "../../../../lib/Timestamp";
import {
  gameSeekAutoAccept,
  gameSeekIsRated,
  maxRating,
  minRating,
} from "../../../constants/gameConstants";
import { RESOURCE_EXAMINE } from "../../../constants/resourceConstants";
import { isReadySubscriptions } from "../../../utils/utils";
import withClientMessages from "../../HOCs/withClientMessages";
import { withDynamicStyles } from "../../HOCs/withDynamicStyles";
import { withPlayNotifier } from "../../HOCs/withPlayNotifier";
import CssManager from "../components/Css/CssManager";
import Loading from "../components/Loading/Loading";
import PlayModaler from "../components/Modaler/PlayModaler/PlayModaler";
import PlayPage from "../components/PlayPage/PlayPage";

const log = new Logger("client/Play_js");

const handleError = (error) => {
  if (error) {
    log.error("handleError", error);
  }
};

class Play extends Component {
  constructor(props) {
    super(props);

    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();

    this.state = {
      gameType: null,
      gameData: null,
    };
  }

  drawCircle = (square, color, size) => {
    const { inGame } = this.props;

    Meteor.call("drawCircle", "DrawCircle", inGame._id, square, color, size, handleError);
  };

  removeCircle = (square) => {
    const { inGame } = this.props;

    Meteor.call("removeCircle", "RemoveCircle", inGame._id, square, handleError);
  };

  _pieceSquareDragStop = (raf) => {
    const { inGame } = this.props;
    Meteor.call("addGameMove", "gameMove", inGame._id, raf.move, handleError);
  };

  _boardFromMongoMessages = (game) => {
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
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
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

  getClientMessage = (id) => {
    return ClientMessagesCollection.findOne({ client_identifier: id });
  };

  genOptions = (gameData) => {
    const friendId = Meteor.userId() === gameData.white.id ? gameData.black.id : gameData.white.id;

    const color = Meteor.userId() === gameData.white.id ? "black" : "white";
    const opponentColor = color === "white" ? "black" : "white";
    const challengerInitial = gameData.clocks[color].initial;
    const challengerIncrementOrDelay = gameData.clocks[color].inc_or_delay;
    const challengerIncrementOrDelayType = gameData.clocks[color].delaytype;
    const receiverInitial = gameData.clocks[opponentColor].initial;
    const receiverIncrementOrDelay = gameData.clocks[opponentColor].inc_or_delay;
    const receiverIncrementOrDelayType = gameData.clocks[opponentColor].delaytype;
    const rated = gameData.rated;

    const options = {
      color,
      challengerInitial,
      challengerIncrementOrDelayType,
      challengerIncrementOrDelay,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      rated,
    };
    return { friendId, options };
  };

  handleRematch = () => {
    const { gameType, gameData } = this.state;

    if (gameType === "startBotGame") {
      this.handleBotPlay(gameData);
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
      color: null,
    };

    const {
      rated,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      color,
    } = options;

    const rating_object = findRatingObject(
      0,
      "white",
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      DynamicRatingsCollection.find({ wild_number: 0 }).fetch()
    );

    if (!rating_object) throw new Meteor.Error("Unable to find a rating type");

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      friendId,
      defaultData.wild_number,
      rating_object.rating_type,
      rated,
      defaultData.is_adjourned,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      color,
      handleError
    );
  };

  handleBotPlay = (gameData) => {
    const {
      wildNumber,
      challengerRatingType,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      skillLevel,
      color,
    } = gameData;

    Meteor.call(
      "startBotGame",
      "play_computer",
      wildNumber,
      challengerRatingType,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      skillLevel,
      color
    );

    this.setState({ gameData, gameType: "startBotGame" });
  };

  handleSeekPlay = (gameData) => {
    const { wildNumber, initial, incrementOrDelay, incrementOrDelayType, color } = gameData;

    const ratingType = findRatingObject(
      0,
      "white", // Right now white and black always match, so just hard code
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      DynamicRatingsCollection.find().fetch()
    );

    Meteor.call(
      "createLocalGameSeek",
      "play_seek",
      wildNumber,
      ratingType.rating_type,
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      gameSeekIsRated,
      color === "random" ? null : color,
      minRating,
      maxRating,
      gameSeekAutoAccept
    );

    this.setState({ gameData, gameType: "startSeekGame" });
  };

  render() {
    const { isReady, gameRequest, inGame, setGameTurn } = this.props;

    if (!isReady) {
      return <Loading />;
    }

    if (inGame) {
      const color = inGame.black === Meteor.user()._id ? "black" : "white";
      setGameTurn(inGame.variations.movelist.length, inGame.tomove === color);
    }
    const { systemCss } = this.props;

    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    };

    const css = new CssManager(systemCss?.systemCss, systemCss?.userCss);
    if (gameRequest) {
      this.message_identifier = "server:game:" + gameRequest._id;
    }

    if (inGame) {
      this.message_identifier = "server:game:" + inGame._id;
      capture = this._boardFromMongoMessages(inGame);
    }

    const gameMessage = this.getClientMessage(this.message_identifier);
    const visible = !!gameMessage && !!inGame && inGame.status === "examining";

    return (
      <div>
        <PlayModaler
          visible={visible}
          gameResult={inGame?.result}
          clientMessage={gameMessage}
          whitePlayerUsername={inGame?.white?.name}
          blackPlayerUsername={inGame?.black?.name}
          onRematch={this.handleRematch}
          onExamine={this.handleExamine}
        />
        <PlayPage
          cssManager={css}
          capture={capture}
          game={inGame}
          onChooseFriend={this.handleChooseFriend}
          onBotPlay={this.handleBotPlay}
          onSeekPlay={this.handleSeekPlay}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          onRemoveCircle={this.removeCircle}
        />
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    const subscriptions = {
      game: Meteor.subscribe("games"),
      //This is what you subscribe to in order to get users playing, observing, examining and owning games you are playing or observing.
      //gameusers: Meteor.subscribe("gameusers"),
      chats: Meteor.subscribe("chat"),
      child_chat_texts: Meteor.subscribe("child_chat_texts"),
      users: Meteor.subscribe("loggedOnUsers"),
      importedGame: Meteor.subscribe("imported_games"),
      dynamic_ratings: Meteor.subscribe("DynamicRatings"),
    };

    return {
      isReady: isReadySubscriptions(subscriptions),

      inGame: Game.findOne({
        $or: [
          {
            $and: [
              { status: "playing" },
              { $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }] },
            ],
          },
          {
            $and: [
              { status: "examining" },
              { $or: [{ "observers.id": Meteor.userId() }, { owner: Meteor.userId() }] },
            ],
          },
        ],
      }),
      gameRequest: GameRequestCollection.findOne(
        {
          $or: [
            {
              challenger_id: Meteor.userId(),
            },
            {
              receiver_id: Meteor.userId(),
            },
            { type: "seek" },
          ],
        },
        {
          sort: { create_date: -1 },
        }
      ),
      systemCss: mongoCss.findOne(),
      userClientMessages: ClientMessagesCollection.find({
        to: Meteor.userId(),
      }).fetch(),
    };
  }),
  withDynamicStyles("systemCss.playNotificationsCss"),
  withPlayNotifier,
  withClientMessages
)(Play);

const game_timestamps = {};

Game.find({
  $and: [
    { status: "playing" },
    { $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }] },
  ],
}).observeChanges({
  added(id, game) {
    let color;
    if (game.white.id === Meteor.userId()) color = "white";
    else if (game.black.id === Meteor.userId()) color = "black";
    if (!color) throw new Meteor.Error("Unable to discern which color we are");
    game_timestamps[id] = {
      color,
      timestamp: new TimestampClient((_, msg) => Meteor.call("gamepong", id, msg)),
    };
  },
  changed(id, fields) {
    if (fields.status && fields.status !== "playing") {
      if (!!game_timestamps[id]) {
        game_timestamps[id].timestamp.end();
        delete game_timestamps[id];
      }
    } else if (fields.lag) {
      if (!game_timestamps[id]) {
        log.error("Unable to find timestamp for played game", id);
        return;
      }
      fields.lag[game_timestamps[id].color].active.forEach((ping) =>
        game_timestamps[id].timestamp.pingArrived(ping)
      );
    }
  },
  removed(id) {
    if (!!game_timestamps[id]) {
      try {
        game_timestamps[id].timestamp.end();
      } catch (e) {
        // For some reason, two removes can come through here...not sure why, but really who cares?
      } finally {
        delete game_timestamps[id];
      }
    }
  },
});
