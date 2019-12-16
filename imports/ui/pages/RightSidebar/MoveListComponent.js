import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class MoveListComponent extends Component {
  _pgnView = (actionType, action) => {
    this.props.performAction(action, actionType);
  };
  render() {
    let moves = this.props.Moves;
    let movesString = [];
    if (moves != null || moves !== undefined) {
      for (let i = 1; i < moves.length; ) {
        if (i + 1 < moves.length) {
          movesString.push(" " + moves[i].move + " " + moves[i + 1].move + " ");
        } else {
          movesString.push(" " + moves[i].move + " ");
        }
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
                  <span style={this.props.cssmanager.gameMoveStyle()}>{move}</span>
                </span>
              ))
            : null}
        </div>

        <div style={this.props.cssmanager.gameButtonMove()}>
          <button
            style={this.props.cssmanager.buttonStyle()}
            onClick={this._pgnView.bind(this, "pgnview", "startposition")}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("fastForward")}
              alt="fast-forward"
            />
          </button>
          <button
            style={this.props.cssmanager.buttonStyle()}
            onClick={this._pgnView.bind(this, "pgnview", "previousOne")}
          >
            <img src={this.props.cssmanager.buttonBackgroundImage("prevIconGray")} alt="previous" />
          </button>
          <button
            style={this.props.cssmanager.buttonStyle()}
            onClick={this._pgnView.bind(this, "pgnview", "nextOne")}
          >
            <img src={this.props.cssmanager.buttonBackgroundImage("nextIconGray")} alt="next" />
          </button>
          <button
            style={this.props.cssmanager.buttonStyle()}
            onClick={this._pgnView.bind(this, "pgnview", "endposition")}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("fastForwardNext")}
              alt="fast-forward-next"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()}>
            <img
              src={this.props.cssmanager.buttonBackgroundImage("nextIconSingle")}
              alt="next-single"
            />
          </button>
          <button style={this.props.cssmanager.buttonStyle()} onClick={this.props.flip}>
            <img src={this.props.cssmanager.buttonBackgroundImage("flipIconGray")} alt="Flip" />
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
