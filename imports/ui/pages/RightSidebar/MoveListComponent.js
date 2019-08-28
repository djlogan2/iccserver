import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // moves: props.Moves
      selectedButton: null,
      moves: [
        "e4",
        "e6",
        "d4",
        "d5",
        "Nd2",
        "c5",
        "exd5",
        "Qxd5",
        "Ngf3",
        "cxd4",
        "Bc4",
        "Qd6"
      ]
    };
    //this.state.moves = props.Moves;
    this.Moves = [];
  }
  componentWillReceiveProps(nextProps) {
    // let move = nextProps.Moves;
    //console.log("moves called ");
    /*  this.setState({
      moves: move
    }); */
    // this.Moves.push(move);
  }
  gameMove(move, gameId) {
    Meteor.call("game-move.insert", move, gameId);
  }
  render() {
    let gameId = this.props.Moves._id;
    return (
      <div>
        {/* <div style={this.props.cssmanager.gameMoveList()}>{this.Moves}</div> */}
        <div style={this.props.cssmanager.gameMoveList()}>
          {this.state.moves
            ? this.state.moves.map((move, index) => (
                <div
                  style={{
                    backgroundColor: "#00BFFF",
                    margin: "5px",
                    height: "auto",
                    width: "50px",
                    display: "inline-block"
                  }}
                  key={index}
                >
                  <div
                    style={{
                      margin: "5px",
                      borderRadius: "2px",
                      color: "white",
                      textAlign: "center"
                    }}
                    onClick={this.gameMove.bind(this, move, gameId)}
                  >
                    {move}
                  </div>
                </div>
              ))
            : null}
        </div>

        <div style={this.props.cssmanager.gameButtonMove()}>
          {/* 
					Game History Button Component
					Different buttons such as next and previous is available for
					player to check the previous moves. this along with GameComponent */}

          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("fastForward")}
              alt="fast-forward"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("prevIconGray")}
              alt="previous"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("nextIconGray")}
              alt="next"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage(
                "fastForwardNext"
              )}
              alt="fast-forward-next"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage(
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
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("flipIconGray")}
              alt="Flip"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("settingIcon")}
              alt="setting-icon"
            />
          </button>
        </div>
      </div>
    );
  }
}
