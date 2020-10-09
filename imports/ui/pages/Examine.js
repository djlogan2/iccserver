import React, { Component } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
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
    log.trace("Examine constructor", props);
    this.userId = null;
    // TODO: You need to quit using Chess.chess() and start using the data from the game record.
    this._board = new Chess.Chess();
    this._boardfallensolder = new Chess.Chess();
    this.userpending = null;
    this.state = {
      isImportedGamesModal: false,
      importedGames: [],
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
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
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/home");
      if (!!this.props.played_game) this.props.history.push("/play");
    }
  }

  initExamine = () => {
    Meteor.call(
      "startLocalExaminedGame",
      "startlocalExaminedGame",
      "Mr white",
      "Mr black",
      0
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
    if (!this.props.game) return;

    const { circles, arrows, _id } = this.props.game;
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
    if (!this.props.game) {
      log.error("How are we dropping pieces on a non-examined game?");
      return;
    }
    Meteor.call("addGameMove", "gameMove", this.props.game._id, raf.move);
  };

  handleObserveUser = userId => {
    log.debug("handleObserveUser", userId);
    if (this.props.game) this.setState({ leaving_game: this.props.game._id });
    Meteor.call("observeUser", "observeUser", userId, err => {
      if (err) {
        debugger;
      }
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
    const game = this.props.game || {
      _id: "bogus",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      white: { id: "bogus", name: "White", rating: 1600 },
      black: { id: "bogus", name: "White", rating: 1600 }
    };
    log.trace("Examine renderObserver", this.props);
    const { systemCss, boardCss } = this.props;

    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

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
          cssManager={css}
          allUsers={this.props.all_users}
          board={this._board}
          observeUser={this.handleObserveUser}
          onPgnUpload={this.handlePgnUpload}
          capture={capture}
          game={game}
          onDrop={this._pieceSquareDragStop}
          ref="main_page"
        />
      </div>
    );
  }

  render() {
    log.trace("Examine render", [this.props, this.state]);
    if (!this.props.isready) return <Loading />;

    if (!this.props.game) {
      if (!this.state.leaving_game) this.initExamine();
      return <Loading />;
    } else if (this.props.game._id === this.state.leaving_game) return <Loading />;

    const game = this.props.game;
    if (!game.examiners || !!game.examiners.some(user => user.id === Meteor.userId()))
      return this.renderObserver();

    const { systemCss, boardCss } = this.props;
    let clientMessage = null;
    let capture = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    const css = new CssManager(systemCss, boardCss);
    this._board.load(game.fen);

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
          capture={capture}
          game={game}
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
  const subscriptions = {
    chats: Meteor.subscribe("chat"),
    clientMessages: Meteor.subscribe("client_messages"),
    css: Meteor.subscribe("css"),
    game: Meteor.subscribe("games"),
    gameHistory: Meteor.subscribe("game_history"),
    gameRequests: Meteor.subscribe("game_requests"),
    importedGame: Meteor.subscribe("imported_games"),
    users: Meteor.subscribe("loggedOnUsers"),
    userData: Meteor.subscribe("userData")
  };

  function isready() {
    for (const k in subscriptions) if (!subscriptions[k].ready()) return false;
    return true;
  }

  return {
    isready: isready(),
    game: Game.findOne({ "observers.id": Meteor.userId() }),
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
