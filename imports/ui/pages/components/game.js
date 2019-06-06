import React from 'react';
import '../css/chessbord';
import ChessBordLayout from '../ChessBordLayout';
import FallenSoldierBlock from './fallen-soldier-block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import PlayerTop from './Players/PlayerTop';
import PlayerBottom from './Players/PlayerBottom';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white',
      blackPlayer: '',
      whitePlayer: '',
      width: 560

    }
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      }
      else {
        squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose destination for the selected piece",
          sourceSelection: i
        });
      }
    }

    else if (this.state.sourceSelection > -1) {
      squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };
      if (squares[i] && squares[i].player === this.state.player) {
        this.setState({
          status: "Wrong selection. Choose valid source and destination again.",
          sourceSelection: -1,
        });
      }
      else {
        const squares = this.state.squares.slice();
        const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
        const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
        const isDestEnemyOccupied = squares[i] ? true : false;
        const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
        const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
        console.log("Sorce ", this.state.sourceSelection);
        console.log("Destination ", i);
        const isMoveLegal = this.isMoveLegal(srcToDestPath);
        if (isMovePossible && isMoveLegal) {
          if (squares[i] !== null) {
            if (squares[i].player === 1) {
              whiteFallenSoldiers.push(squares[i]);
            }
            else {
              blackFallenSoldiers.push(squares[i]);
            }
          }
          squares[i] = squares[this.state.sourceSelection];
          console.log("squares[i]", squares[i]);
          squares[this.state.sourceSelection] = null;
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.state.turn === 'white' ? 'blue' : 'white';
          this.setState({
            sourceSelection: -1,
            squares: squares,
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers,
            player: player,
            status: '',
            turn: turn
          });

        }
        else {
          this.setState({
            status: "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1,
          });
        }
      }
    }

  }
  /* componentDidUpdate(prevProps) {
   
    console.log("Prevpops",prevProps);
    console.log("this props",this.props);
  } */
  /**
   * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
   * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
   * @return {Boolean}               
   */
  isMoveLegal(srcToDestPath) {
    let isLegal = true;
    for (let i = 0; i < srcToDestPath.length; i++) {
      if (this.state.squares[srcToDestPath[i]] !== null) {
        isLegal = false;
      }
    }
    return isLegal;
  }
  componentDidMount() {
    this.updateHeight();
    window.addEventListener("resize", this.updateHeight);

  }


  componentWillUnmount() {
    window.removeEventListener("resize", this.updateHeight);
  }
  updateHeight() {

    if (this.state.width != this.div.clientWidth) {
      this.setState({ width: this.div.clientWidth })
    }

  }

  componentDidUpdate(prevProps, prevState) {
    this.updateHeight();
    console.log("Height", this.state.width);

    if (prevProps.gameStart !== this.props.gameStart && this.props.gameStart['type'] === 'game_start') {
      this.setState({ blackPlayer: this.props.gameStart['message']['black'], whitePlayer: this.props.gameStart['message']['white'] });

    }


  }

  render() {
    let gamedata = this.props.gameStart;
    // let bordwidth = this.props.gamebordWidth;
    let gameMove = '';
    let gameStart = '';
    let blackPlayer = '';
    let whitePlayer = '';
    let gameclock = '';
    let blackPlayerClock = '';
    let whitePlayerClock = '';

    if (gamedata['type'] === 'game_move') {
      gameMove = gamedata['message']['algebraic'];
    }
    if (gamedata['type'] === 'update_game_clock') {
      gameclock = gamedata['message'];

      if (gameclock['color'] === 'b') {
        blackPlayerClock = gamedata['message'];
      } else {
        whitePlayerClock = gamedata['message'];
      }
      // console.log("blackPlayerClock", blackPlayerClock);

    }
    //console.log(gamedata);
    /*
    for (const key in gamedata) {

      if (gamedata[key]['type'] === 'game_start') {
        blackPlayer = gamedata[key]['message']['black'];
        whitePlayer = gamedata[key]['message']['white'];
      }
      if (gamedata[key]['type'] === 'game_move') {
        gameMove = gamedata[key]['message']['algebraic'];
      }
      if (gamedata[key]['type'] === 'update_game_clock') {
        gameclock = gamedata[key]['message'];
        if (gameclock['color'] === 'b') {
          blackPlayerClock = gamedata[key]['message'];
        } else {
          whitePlayerClock = gamedata[key]['message'];
        }
        console.log("blackPlayerClock", blackPlayerClock);

      }
    } */

    /*  console.log("gameClock:",gameclock);
    console.log("balckPlayer:",balckPlayer);
    console.log("whitePlayer:",whitePlayer); */

    return (
      <div>
        <PlayerTop playerInfo={this.state.blackPlayer} gameClockInfo={blackPlayerClock} />
        <div>
          <div className="game" ref={div => { this.div = div; }}>
            <div className="game-board" >
              <ChessBordLayout bordwidth={this.state.width} gameMove={gameMove} />
            </div>
            <div className="game-info">
              <h3>Turn</h3>
              <div id="player-turn-box" style={{ backgroundColor: this.state.turn }}>
              </div>
              <div className="game-status">{this.state.status}</div>
              <div className="fallen-soldier-block">
                {<FallenSoldierBlock
                  whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                  blackFallenSoldiers={this.state.blackFallenSoldiers}
                />
                }
              </div>
            </div>
          </div>
        </div>
        <PlayerBottom playerInfo={this.state.whitePlayer} gameClockInfo={whitePlayerClock} />
      </div>
    );
  }
}

