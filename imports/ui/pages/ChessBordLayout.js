import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chess } from "chess.js";// import Chess from  "chess.js"(default) if recieving an error about new Chess not being a constructor

import Chessboard from "chessboardjsx";

class Gamebord extends Component {
  static propTypes = { children: PropTypes.func };

  state = { fen: "start", width: 480 };

  componentDidMount() {
    this.game = new Chess();
    window.addEventListener("resize", this.updateWindowDimensions);
    console.log("Game Constructer created");
  }

  componentWillUnmount() {
    window.clearTimeout(this.timer());
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.gameMove !== this.props.gameMove) {

      this.makeMove(this.props.gameMove);
    }

  }
  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth });
  };

  makeMove = (moves) => {
    // let possibleMoves = this.game.moves();
    //  let chessMove = ["c4", "e5", "e3", "b6", "h3", "d5", "f3", "b5", "Kf2", "Qg5", "f4", "Ke7", "c5", "Qg6", "Nf3", "b4", "Bb5", "a6", "h4", "Ra7", "Be8", "Nd7", "Nd4", "Nxc5", "Nb5", "Na4", "Qf3", "Qd6"];
    // exit if the game is over
    if (
      this.game.game_over() === true ||
      this.game.in_draw() === true
    )
      return;

    //let randomIndex = Math.floor(Math.random() * possibleMoves.length);
    //this.game.move(chessMove[this.state.count]);
    //console.log("State Value", this.state.count);

    this.game.move(moves);

    //  console.log();
    this.setState({ fen: this.game.fen() });
    //this.setState({ count: this.state.count + 1 });



  };

  render() {
    const { fen } = this.state;
    //    return this.props.children({ position: fen });
    return (
      <Chessboard

        width={this.state.width}
        position={fen}
        transitionDuration={300}
        darkSquareStyle={{ backgroundColor: 'rgb(21,101,192)' }}
        lightSquareStyle={{ backgroundColor: 'rgb(255,255,255)' }}
        boardStyle={{
          borderRadius: "5px",
          boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
        }}
      />);
  }
}

class ChessBordLayout extends Component {
  render() {
    let gameMove = this.props.gameMove;

    return (
      <div>
        <Gamebord gameMove={gameMove} />
      </div>
    );
  }
}
export default ChessBordLayout;