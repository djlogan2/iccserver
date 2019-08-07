import React, { Component } from "react";
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);

    this.Moves = [];
  }
  componentWillReceiveProps(nextProps) {
    let move = nextProps.Moves;
    this.Moves.push(move);
  }
  render() {
    return (
      <div>
        <div style={this.props.CssManager.gameMoveList()}>{this.Moves}</div>

        <div style={this.props.CssManager.gameButtonMove()}>
          {/* 
					Game History Button Component
					Different buttons such as next and previous is available for
					player to check the previous moves. this along with GameComponent */}

          <button>
            <img src="images/fast-forward-prev.png" alt="fast-forward-prev" />
          </button>
          <button>
            <img src="images/prev-icon-gray.png" alt="prev" />
          </button>
          <button>
            <img src="images/next-icon-gray.png" alt="next" />
          </button>
          <button>
            <img src="images/fast-forward-next.png" alt="fast-forward-next" />
          </button>
          <button>
            <img src="images/next-icon-single.png" alt="next" />
          </button>

          {/*
					 Game Board flip Component
					  And
					 Game Board Setting Component
					 Player can flip the position of the Board (top/bottom).
					 Player can change the game board colour, peace.
					 this along with GameComponent
 					*/}

          <button>
            <img src="images/flip-icon-gray.png" alt="flip" />
          </button>

          <button>
            <img src="images/setting-icon.png" alt="setting" />
          </button>
        </div>
      </div>
    );
  }
}
