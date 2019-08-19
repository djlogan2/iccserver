import React, { Component } from "react";
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moves: props.Moves
    };
    //this.state.moves = props.Moves;
    this.Moves = [];
  }
  componentWillReceiveProps(nextProps) {
    let move = nextProps.Moves;
    //console.log("moves called ");
    this.setState({
      moves: move
    });
    this.Moves.push(move);
  }
  render() {
    return (
      <div>
        <div style={this.props.CssManager.gameMoveList()}>
          {this.Moves}
        </div>

        <div style={this.props.CssManager.gameButtonMove()}>
          {/* 
					Game History Button Component
					Different buttons such as next and previous is available for
					player to check the previous moves. this along with GameComponent */}

          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage("fastForward")}
              alt="fast-forward"
            />
          </button>
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage("prevIconGray")}
              alt="previous"
            />
          </button>
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage("nextIconGray")}
              alt="next"
            />
          </button>
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage(
                "fastForwardNext"
              )}
              alt="fast-forward-next"
            />
          </button>
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage(
                "nextIconSingle"
              )}
              alt="next-single"
            />
          </button>
          {/*
					 Game Board flip Component
					  And
					 Game Board Setting Component
					 Player can flip the position of the Board (top/bottom).
					 Player can change the game board colour, peace.
					 this along with GameComponent
 					*/}
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage("flipIconGray")}
              alt="Flip"
            />
          </button>
          <button style={this.props.CssManager.buttonStyle()}>
            <img
              src={this.props.CssManager.buttonBackgroundImage("settingIcon")}
              alt="setting-icon"
            />
          </button>
        </div>
      </div>
    );
  }
}
