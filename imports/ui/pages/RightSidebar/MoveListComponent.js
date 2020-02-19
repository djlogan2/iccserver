import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";
import { object } from "prop-types";
const log = new Logger("MoveLIst_js");
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    this.cmi = 0;
    this.state = {
      current: 0
    };
  }
  _pgnView = (actionType, action) => {};
  moveBackwordBeginning = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, this.cmi - 1, 1);
  };
  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, 1);
    this.setState(state => {
      return { current: state.current - 1 };
    });
  };
  moveForward = () => {
    Meteor.call("moveForward", "MoveForward", this.gameId, 1);
    this.setState(state => {
      return { current: state.current + 1 };
    });
  };
  moveForwardEnd = cmi => {
    Meteor.call("moveForward", "MoveForward", this.gameId, this.cmi - 1);
    this.setState({ current: this.cmi - 2 });
  };
  render() {
    let moves = [];
    let movesString = [];
    let variation;
    let game = this.props.game;
    this.gameId = game._id;
    let displayButton = 1;
    if (!!game.status && game.status === "examining" && this.props.currentGame === false)
      displayButton = 0;
    if (!!game.status && game.status !== "examining") {
      if (!!game && game.variations !== undefined) {
        variation = game.variations;
        let itemToBeRemoved = [];
        for (let i = 0; i < variation.cmi; i++) {
          if (itemToBeRemoved.indexOf(i) === -1) {
            var moveListItem = variation.movelist[i];
            if (moveListItem !== undefined) {
              var variationI = moveListItem.variations;
              if (variationI !== undefined) {
                var len = variationI.length;
                if (len === 1 && variation.movelist[variationI[0]] !== undefined) {
                  moves.push(variation.movelist[variationI[0]].move);
                } else if (len > 1) {
                  if (variation.movelist[variationI[len - 1]] !== undefined) {
                    moves.push(variation.movelist[variationI[len - 1]].move);
                  }
                  if (variation.cmi === variationI[len - 1]) {
                    break;
                  }
                  for (let n = variationI[0]; n < variationI[len - 1]; n++) {
                    itemToBeRemoved.push(n);
                  }
                }
              }
            }
          }
        }
      }
    } else {
      this.cmi = game.variations.movelist.length || 0;
      for (let i = 1; i < game.variations.movelist.length; i++) {
        moves.push(game.variations.movelist[i].move);
      }
    }
    /* if (moves != null || moves !== undefined) {
      for (let i = 0; i < moves.length; ) {
        if (i + 1 < moves.length) {
          movesString.push(" " + moves[i] + " " + moves[i + 1] + " ");
        } else {
          movesString.push(" " + moves[i] + " ");
        }
        i = i + 2;
      }
    } */

    let mstyle = this.props.cssmanager.gameButtonMove();
    if (this.props.currentGame === true) {
      Object.assign(mstyle, { bottom: "26px" });
    } else {
      Object.assign(mstyle, { bottom: "85px" });
    }
    let cnt = 1;
    let ind = "";
    let moveslist = moves.map((move, index) => {
      if (index % 2 === 0) {
        ind = " " + cnt + ".";
        cnt++;
      } else {
        ind = "";
      }
      let style = { color: "black" };
      let movestyle = this.state.current === index ? Object.assign(style, { color: "red" }) : style;

      return (
        <span key={index}>
          {ind ? <b>{ind}</b> : null}
          <span style={movestyle}> {move}</span>
        </span>
      );
    });
    return (
      <div>
        <div style={this.props.cssmanager.gameMoveList()}>{moveslist}</div>
        {displayButton ? (
          <div style={mstyle}>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this.moveBackwordBeginning.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("fastForward")}
                alt="fast-forward"
              />
            </button>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this.moveBackword.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("prevIconGray")}
                alt="previous"
              />
            </button>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this.moveForward.bind(this)}
            >
              <img src={this.props.cssmanager.buttonBackgroundImage("nextIconGray")} alt="next" />
            </button>
            <button
              style={this.props.cssmanager.buttonStyle()}
              onClick={this.moveForwardEnd.bind(this, 1)}
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
        ) : null}
      </div>
    );
  }
}
