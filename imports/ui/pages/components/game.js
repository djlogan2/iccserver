import React from "react";
import "../css/chessbord";
import Board from "./Board.js";
import Chess from "chess.js";
import FallenSoldierBlock from "./fallen-soldier-block.js";
import PlayerTop from "./Players/PlayerTop";
import PlayerBottom from "./Players/PlayerBottom";
import { Logger } from "../../../../lib/client/Logger";
const log = new Logger("ui/pages/components/game_js");

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    var d = new Date();
    var curr_day = d.getDay();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    this._chess = new Chess.Chess();
    this._chess.header("White", "White");
    this._chess.header("Black", "Black");
    this._chess.header("WhiteElo", "1600");
    this._chess.header("BlackElo", "1600");
    this._chess.header("Event", "ICC");
    this._chess.header("Round", "?");
    this._chess.header(
      "Date",
      curr_year + "." + Game.pad(curr_month) + "." + Game.pad(curr_day)
    );
    this.state = {
      board: this._chess.board(),
      clocks: {
        w: 0,
        b: 0
      },
      fallen_soldiers: {
        w: [],
        b: []
      },
      top: "b",
      tomove: "w",
      sourceSelection: -1,
      status: ""
    };
  }

  makeMove(move) {
    const move_obj = this._chess.move(move);
    const fallen_soldiers = this.state.fallen_soldiers[this._chess.turn()];

    if (move_obj.captured) {
      fallen_soldiers.push(move_obj.captured);
    }

    if (move_obj.promotion) {
      const idx = fallen_soldiers.indexOf(move_obj.promotion);
      if (idx !== -1) {
        fallen_soldiers.splice(idx, 1);
      }
    }

    let state = {
      ...this.state,
      board: this._chess.board(),
      tomove: this._chess.turn()
    };
    state.fallen_soldiers[this._chess.turn()] = fallen_soldiers;

    this.setState(state);
  }

  handleClick(i) {
    log.error("Handle clicks");
    /*
    const squares = this.STATE.SQUARES.slice();
    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        this.setState({
          status:
            "Wrong selection. Choose player " + this.state.player + " pieces."
        });
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      } else {
        squares[i].style = {
          ...squares[i].style,
          backgroundColor: "RGB(111,143,114)"
        }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose destination for the selected piece",
          sourceSelection: i
        });
      }
    } else if (this.state.sourceSelection > -1) {
      squares[this.state.sourceSelection].style = {
        ...squares[this.state.sourceSelection].style,
        backgroundColor: ""
      };
      if (squares[i] && squares[i].player === this.state.player) {
        this.setState({
          status: "Wrong selection. Choose valid source and destination again.",
          sourceSelection: -1
        });
      } else {
        const squares = this.STATE.SQUARES.slice();
        const whiteFallenSoldiers = this.state.WHITEFALLENSOLDIERS.slice();
        const blackFallenSoldiers = this.state.BLACKFALLENSOLDIERS.slice();
        const isDestEnemyOccupied = !!squares[i];
        const isMovePossible = squares[
          this.state.sourceSelection
        ].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
        const srcToDestPath = Pawn.getSrcToDestPath(this.state.sourceSelection, i);
        log.debug("Sorce ", this.state.sourceSelection);
        log.debug("Destination ", i);
        const isMoveLegal = this.isMoveLegal(srcToDestPath);
        if (isMovePossible && isMoveLegal) {
          if (squares[i] !== null) {
            if (squares[i].player === 1) {
              whiteFallenSoldiers.push(squares[i]);
            } else {
              blackFallenSoldiers.push(squares[i]);
            }
          }
          squares[i] = squares[this.state.sourceSelection];
          log.debug("squares[i]", squares[i]);
          squares[this.state.sourceSelection] = null;
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.STATE.TURN === "white" ? "blue" : "white";
          this.setState({
            sourceSelection: -1,
            squares: squares,
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers,
            player: player,
            status: "",
            turn: turn
          });
        } else {
          this.setState({
            status:
              "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1
          });
        }
      }
    }
  }

     */
    /* componentDidUpdate(prevProps) {
   
    console.log("Prevpops",prevProps);
    console.log("this props",this.props);

   */
  }

  render() {
    /*
    let gamedata = this.props.gameStart;
    let gameMove = "";
    let gameStart = "";
    let blackPlayer = "";
    let whitePlayer = "";
    let gameclock = "";
    for (const key in gamedata) {
      if (gamedata.hasOwnProperty(key)) {
        if (gamedata[key]["type"] === "game_start") {
          blackPlayer = gamedata[key]["message"]["black"];
          whitePlayer = gamedata[key]["message"]["white"];
        }
        if (gamedata[key]["type"] === "game_move") {
          gameMove = gamedata[key]["message"];
        }
        if (gamedata[key]["type"] === "update_game_clock") {
          gameclock = gamedata[key]["message"];
        }
      }
    }

    log.debug(gameMove);
     */
    /*  console.log("gameClock:",gameclock);
    console.log("balckPlayer:",balckPlayer);
    console.log("whitePlayer:",whitePlayer); */

    return (
      <div>
        <PlayerTop
          playerInfo={
            this._chess.header()[this.state.top === "w" ? "White" : "Black"]
          }
          gameClockInfo={this.state.clocks[this.state.top]}
        />
        <div>
          <div className="game">
            <div className="game-board">
              <Board
                board={this.state.board}
                onClick={i => this.handleClick(i)}
              />
            </div>
            <div className="game-info">
              <h3>Turn</h3>
              <div
                id="player-turn-box"
                style={{ backgroundColor: "ptb-" + this.state.tomove }}
              />
              <div className="game-status">{this.state.status}</div>
              <div className="fallen-soldier-block">
                {
                  // TODO: Change this to just the object itself
                  <FallenSoldierBlock
                    whiteFallenSoldiers={this.state.fallen_soldiers["w"]}
                    blackFallenSoldiers={this.state.fallen_soldiers["b"]}
                  />
                }
              </div>
            </div>
          </div>
        </div>
        <PlayerBottom
          playerInfo={
            this._chess.header()[this.state.top === "w" ? "Black" : "White"]
          }
          gameClockInfo={this.state.clocks[this.state.top === "w" ? "b" : "w"]}
        />
      </div>
    );
  }

  static pad(num) {
    if (num < 10) return "0" + num;
    else return "" + num;
  }
}
