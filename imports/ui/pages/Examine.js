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
    this.userId = null;
    // You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;
    this.state = {
      isImportedGamesModal: false,
      importedGames: [],
      subscription: {
        chats: Meteor.subscribe("chat"),
        clientMessages: Meteor.subscribe("client_messages"),
        css: Meteor.subscribe("css"),
        game: Meteor.subscribe("games"),
        gameHistory: Meteor.subscribe("game_history"),
        gameRequests: Meteor.subscribe("game_requests"),
        importedGame: Meteor.subscribe("imported_games"),
        users: Meteor.subscribe("loggedOnUsers")
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
  }

  componentWillUnmount() {
    if (this.state.subscription) {
      this.state.subscription.chats && this.state.subscription.chats.stop();
      this.state.subscription.clientMessages && this.state.subscription.clientMessages.stop();
      this.state.subscription.css && this.state.subscription.css.stop();
      this.state.subscription.game && this.state.subscription.game.stop();
      this.state.subscription.gameHistory && this.state.subscription.gameHistory.stop();
      this.state.subscription.gameRequests && this.state.subscription.gameRequests.stop();
      this.state.subscription.importedGame && this.state.subscription.importedGame.stop();
      this.state.subscription.users && this.state.subscription.users.stop();
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
    // if (Meteor.user() && Meteor.user().status && Meteor.user().status.game === "examining") {
    //   return;
    // }
    //
    if (!this.props.examine_game && !this.props.observe_game) return;

    const game = this.props.examine_game || this.props.observe_game;
    const { circles, arrows, _id } = game;
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
      const { brush, orig } = item;
      const size = 1; // hardcode
      Meteor.call("drawCircle", "DrawCircle", gameId, orig, brush, size, handleError);
    });
  };

  removeCircles = (gameId, list) => {
    list.forEach(item => {
      const { orig } = item;
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
      const { mouseSq, orig } = item;
      Meteor.call("removeArrow", "RemoveArrow", gameId, orig, mouseSq, handleError);
    });
  };

  _pieceSquareDragStop = raf => {
    if (!this.props.examine_game) {
      log.error("How are we dropping pieces on a non-examined game?");
      return;
    }
    Meteor.call("addGameMove", "gameMove", this.props.examine_game._id, raf.move);
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

  _boardFromMongoMessages(game) {
    let position = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
    };

    const shortfen = game.fen.split(" ")[0];
    let i = shortfen.length;

    while (i--) {
      let pc = shortfen.charAt(i);
      let color = pc > "A" ? "w" : "b";
      pc = pc.toLowerCase();
      position[color][pc]--;
    }

    return position;
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
      log.error("Examine LOADING/1");
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
      log.error("Examine LOADING/2");
      return <Loading />;
    }

    const css = new CssManager(systemCss, boardCss);

    log.debug("Calling GameListModal 1");
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
          onDrop={this._pieceSquareDragStop}
          ref="main_page"
        />
      </div>
    );
  }
  render() {
    if (!this.props.examine_game && !this.props.observe_game) {
      log.error("Examine LOADING/3");
      return <Loading />;
    }

    if (!!this.props.observe_game) return this.renderObserver();
    else if (!this.props.examine_game) {
      log.error("Examine LOADING/4");
      return <Loading />;
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
      log.error("Examine LOADING/5");
      return <Loading />;
    }

    const css = new CssManager(systemCss, boardCss);
    if (!!this.props.played_game) {
      this.message_identifier = "server:game:" + this.props.played_game._id;
      capture = this._boardFromMongoMessages(this.props.played_game);
    } else {
      if (!!this.props.examine_game) {
        this._examinBoard(this.props.examine_game);
      }
    }

    log.debug("Calling GameListModal 2");
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
          game={this.props.played_game || this.props.examine_game}
          clientMessage={clientMessage}
          onDrop={this._pieceSquareDragStop}
          onDrawObject={this.handleDraw}
          ref="main_page"
        />
      </div>
    );
  }
}

export default withTracker(() => {
  return {
    examine_game: Game.findOne({ "examiners.id": Meteor.userId() }),
    observe_game: Game.findOne({
      $and: [{ "observers.id": Meteor.userId() }, { "examiners.id": { $ne: Meteor.userId() } }]
    }),
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
    all_users: Meteor.users.find().fetch(),
    played_game: Game.findOne({
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
