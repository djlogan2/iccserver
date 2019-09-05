import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    //this.state.moves = props.Moves;

    this.Moves = [];
  }

  render() {
    let gameId = this.props.Moves._id;
    var moves = this.props.Moves.moves;
    var movesString = [];
    let count = 1;
    if (moves != null || moves !== undefined) {
      for (let i = 0; i < moves.length; ) {
        if (i + 1 < moves.length) {
          movesString.push(" " + moves[i] + " " + moves[i + 1] + " ");
        } else {
          movesString.push(" " + moves[i] + " ");
        }
        count = count + 1;
        i = i + 2;
      }
    }

    return (
      <div>
        <div style={this.props.cssmanager.gameMoveList()}>
          {movesString
            ? movesString.map((move, index) => (
                <span key={index}>
                  <b>{index + 1}.</b>
                  <span style={this.props.cssmanager.gameMoveStyle()}>
                    {move}
                  </span>
                </span>
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
          <button
            style={this.props.cssmanager.buttonStyle()}
            onClick={this.props.flip}
          >
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
