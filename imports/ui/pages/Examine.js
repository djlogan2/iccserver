import React, { Component } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import GameListModal from "./components/Modaler/GameListModal";
import Chess from "chess.js";
import {
  ClientMessagesCollection,
  Game,
  GameRequestCollection,
  ImportedGameCollection,
  mongoCss,
  mongoUser
} from "../../api/client/collections";

const log = new Logger("client/Examine_js");

let handleError = error => {
  if (error) {
    log.error(error);
  }
};

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
      isImportedGamesModal: false,
      importedGames: [],
      subscription: {
        css: Meteor.subscribe("css"),
        users: Meteor.subscribe("loggedOnUsers"),
        chats: Meteor.subscribe("chat"),
        game: Meteor.subscribe("games"),
        gameRequests: Meteor.subscribe("game_requests"),
        clientMessages: Meteor.subscribe("client_messages"),
        gameHistory: Meteor.subscribe("game_history"),
        importedGame: Meteor.subscribe("imported_games")
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
    this.removeGameHistory = this.removeGameHistory.bind(this);
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

  componentDidUpdate(prevProps, prevState) {
    if (Meteor.user() && Meteor.user().status) {
      if (Meteor.user().status.game === "playing") {
        this.props.history.push("/play");
      }
      if (
        prevProps.user &&
        prevProps.user.status &&
        prevProps.user.status.game === "examining" &&
        Meteor.user().status.game === "none"
      ) {
        // this.props.history.push("/");
      }
    }
    if (!this.state.isAuthenticated) {
      this.props.history.push("/home");
    }
  }

  startExamine = () => {
    let examine_game = Game.findOne({ "examiners.id": Meteor.userId() });
    if (!examine_game) {
      this.initExamine();
    } else if (Meteor.user() && Meteor.user().status && Meteor.user().status.game !== "examining") {
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

  userRecord() {
    return mongoUser.find().fetch();
  }

  isAuthenticated() {
    return Meteor.userId() !== null;
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

  handleDraw = objectList => {
    if (Meteor.user() && Meteor.user().status && Meteor.user().status.game === "examining") {
      return;
    }

    let { circles, arrows, _id } = this.props.examine_game;
    let circleList = objectList.filter(({ orig, mouseSq }) => orig === mouseSq);
    let arrowList = objectList.filter(({ orig, mouseSq }) => orig !== mouseSq);

    let circlesToAdd = circleList.filter(circle => {
      let index = circles.findIndex(circleItem => circleItem.square === circle.orig);
      return index === -1;
    });
    let circlesToRemove = circleList.filter(circle => {
      let index = circles.findIndex(circleItem => circleItem.square === circle.orig);
      return index !== -1;
    });

    let arrowsToAdd = arrowList.filter(arrow => {
      let index = arrows.findIndex(arrowItem => {
        return arrowItem.from === arrow.orig && arrowItem.to === arrow.dest;
      });
      return index === -1;
    });
    let arrowsToRemove = arrowList.filter(arrow => {
      let index = arrows.findIndex(arrowItem => {
        return arrowItem.from === arrow.orig && arrowItem.to === arrow.dest;
      });
      return index !== -1;
    });

    if (circlesToAdd.length > 0) {
      this.drawCircles(_id, circlesToAdd);
    }
    if (arrowsToAdd.length > 0) {
      this.drawArrows(_id, arrowsToAdd);
    }
    if (circlesToRemove.length > 0) {
      this.removeCircles(_id, circlesToRemove);
    }
    if (arrowsToRemove.length > 0) {
      this.removeArrows(_id, arrowsToRemove);
    }
  };

  drawCircles = (gameId, list) => {
    list.forEach(item => {
      const { brush, mouseSq, orig } = item;
      const size = 1; // hardcode
      Meteor.call("drawCircle", "DrawCircle", gameId, orig, brush, size, handleError);
    });
  };

  removeCircles = (gameId, list) => {
    list.forEach(item => {
      const { brush, mouseSq, orig } = item;
      Meteor.call("removeCircle", "RemoveCircle", gameId, orig, handleError);
    });
  };

  drawArrows = (gameId, list) => {
    list.forEach(item => {
      const { brush, mouseSq, orig } = item;
      const size = 1; // hardcode
      Meteor.call("drawArrow", "DrawArrow", gameId, orig, mouseSq, brush, size, handleError);
    });
  };

  removeArrows = (gameId, list) => {
    list.forEach(item => {
      const { brush, mouseSq, orig } = item;
      Meteor.call("removeArrow", "RemoveArrow", gameId, orig, mouseSq, handleError);
    });
  };

  _pieceSquareDragStop = raf => {
    Meteor.call("addGameMove", "gameMove", this.gameId, raf.move);
  };

  handleObserveUser = userId => {
    Meteor.call("observeUser", "observeUser", userId, err => {
      if (err) {
        debugger;
      }
    });
  };
  handleUnobserveUser = userId => {
    let that = this;
    Meteor.call("localUnobserveAllGames", "localUnobserveAllGames", userId, err => {
      if (err) {
      }
      that.initExamine();
    });
  };

  // gameHistoryload(data) {
  //   if (data === "mygame") {
  //     const GameHistory = GameHistoryCollection.find({
  //       $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
  //     }).fetch();
  //     GameHistory.is_imported = false;
  //     this.setState({ GameHistory: GameHistory });
  //   } else if (data === "uploadpgn") {
  //     const importedGame = ImportedGameCollection.find({}).fetch();
  //     importedGame.is_imported = true;
  //     this.setState({ GameHistory: importedGame });
  //   }
  // }

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
        const moveListItem = variation.movelist[i];
        if (moveListItem !== undefined) {
          const variationI = moveListItem.variations;
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
    if (game.fen) {
      this._board.load(game.fen);
    }
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

  // TODO: This really makes no sense, does it? Why use an observeChanges().added() when
  //       Meteor already sends you new records? If you are writing this reactively,
  //       shouldn't you just be using a Tracker like you are already doing for all of
  //       your other collections? Why is this one different?
  handlePgnUpload = fileData => {
    let that = this;
    let count = 0;
    ImportedGameCollection.find({ fileRef: fileData._id }).observeChanges({
      added: () => {
        if (count === 0) {
          count = count + 1;
          setTimeout(() => {
            let importedGames = ImportedGameCollection.find({ fileRef: fileData._id }).fetch();
            debugger;
            that.setState({
              isImportedGamesModal: true,
              importedGames: importedGames
            });
          }, 10);
        }
      }
    });
  };

  renderObserver() {
    const game = this.props.observe_game;

    if (!game) {
      return <Loading />;
    }

    const { systemCss, boardCss } = this.props;

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

    return (
      <div className="examine">
        <GameListModal
          isImported={true}
          visible={this.state.isImportedGamesModal}
          gameList={this.state.importedGames}
          onClose={() => {
            this.setState({ isImportedGamesModal: false });
          }}
        />
        <ExaminePage
          userId={Meteor.userId()}
          user={Meteor.user()}
          cssManager={css}
          allUsers={this.props.all_users}
          board={this._board}
          observeUser={this.handleObserveUser}
          onPgnUpload={this.handlePgnUpload}
          unObserveUser={this.handleUnobserveUser}
          capture={capture}
          game={game}
          GameHistory={this.state.GameHistory}
          removeGameHistory={this.removeGameHistory}
          onDrop={this._pieceSquareDragStop}
          ref="main_page"
        />
      </div>
    );
  }
  render() {
    if (Meteor.user().status.game !== "examining" && Meteor.user().status.game !== "observing") {
      return <Loading />;
    }

    if (Meteor.user().status.game === "observing") {
      return this.renderObserver();
    }

    if (!this.props.examine_game) {
      return <Loading />;
    }

    // let examineGame = this.props.examine_game[this.props.examine_game.length - 1];
    // if (!examineGame.fen) {
    //   debugger;
    //   return <Loading />
    // }
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
      if (!!gameExamin) {
        game = gameExamin;
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

    return (
      <div className="examine">
        <GameListModal
          isImported={true}
          visible={this.state.isImportedGamesModal}
          gameList={this.state.importedGames}
          onClose={() => {
            this.setState({ isImportedGamesModal: false });
          }}
        />
        <ExaminePage
          cssManager={css}
          allUsers={this.props.all_users}
          board={this._board}
          observeUser={this.handleObserveUser}
          onPgnUpload={this.handlePgnUpload}
          unObserveUser={this.handleUnobserveUser}
          capture={capture}
          game={game}
          GameHistory={this.state.GameHistory}
          removeGameHistory={this.removeGameHistory}
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          ref="main_page"
          examing={gameExamin}
          circles={circles}
        />
      </div>
    );
  }
}

export default withTracker(() => {
  return {
    examine_game: Game.findOne({ "examiners.id": Meteor.userId() }),
    observe_game: Game.findOne({ "observers.id": Meteor.userId() }),
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
    all_games: Game.find({
      $or: [{ status: "playing" }, { status: "examining" }]
    }).fetch(),
    all_users: Meteor.users.find().fetch(),
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
