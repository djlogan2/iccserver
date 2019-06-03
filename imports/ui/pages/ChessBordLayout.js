import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chess } from "chess.js";// import Chess from  "chess.js"(default) if recieving an error about new Chess not being a constructor

import Chessboard from "chessboardjsx";

class Gamebord extends Component {
  static propTypes = { children: PropTypes.func };

  state = { fen: "start", width: 490 };

  componentDidMount() {

    this.game = new Chess();
    let width = this.props.bordwidth;
    console.log("Gamebord", width);
    this.setState({ width: width });
    this.makeMove(this.props.gameMove);

    //this.updateWindowDimensions();
    //window.addEventListener("resize", this.updateWindowDimensions);

  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.gameMove !== this.props.gameMove) {
      //  this.updateWindowDimensions();
      let width = this.props.bordwidth;
      console.log("Gamebord", width);
      this.setState({ width: width });
      this.makeMove(this.props.gameMove);

    }

  }
  /*
  updateWindowDimensions = () => {
    console.log(window.innerWidth);
    if (window.innerWidth === 1024) {
      this.setState({ width: 686 });
    } else if (window.innerWidth >= 1025 && window.innerWidth === 1199) {
      this.setState({ width: 430 });
    } else if (window.innerWidth >= 1200 && window.innerWidth === 1365) {
      this.setState({ width: 430 });
    } else if (window.innerWidth >= 1366 && window.innerWidth === 1439) {
      this.setState({ width: 490 });
    } else if (window.innerWidth >= 1440 && window.innerWidth === 1599) {
      this.setState({ width: 515 });
    } else if (window.innerWidth >= 1600 && window.innerWidth === 1679) {
      this.setState({ width: 575 });
    } else if (window.innerWidth >= 1680 && window.innerWidth === 1919) {
      this.setState({ width: 600 });
    } else if (window.innerWidth >= 1920) {
      this.setState({ width: 800 });
    } else {
      this.setState({ width: window.innerWidth });
    }

  };
*/

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
        lightSquareStyle={{ backgroundColor: 'rgb(255,255,255) ' }}
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
    let bordwidth = this.props.bordwidth;
    console.log("ChessBordLayout", bordwidth);
    return (
      <div>
        <Gamebord gameMove={gameMove} bordwidth={bordwidth} />
      </div>
    );
  }
}
export default ChessBordLayout;