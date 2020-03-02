/* eslint-disable prettier/prettier */
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
      current: null,
      cmi:0
    };
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.game.variations.cmi!==this.props.game.variations.cmi){
        this.setState({cmi:nextProps.game.variations.cmi});
    }
  }
  moveBackwordBeginning = () => {
    
    Meteor.call("moveBackward", "MoveBackward", this.gameId,this.state.cmi);
    
  };
  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, 1);
    
   
  };
  moveForward = () => {
    Meteor.call("moveForward", "MoveForward", this.gameId, 1);
   
}
  moveForwardEnd = cmi => {
   
    Meteor.call("moveForward", "MoveForward", this.gameId,this.cmi-this.state.cmi);
   
  };
 addmove(move_number, variations, white_to_move, movelist, idx) { let string = "";
  if (!movelist[idx].variations || !movelist[idx].variations.length) return "";
  string += movelist[movelist[idx].variations[0]].move+"|";
  let next_move_number = move_number;
  let next_white_to_move = !white_to_move;
  if (next_white_to_move) next_move_number++;
   string +=
   this.addmove(
      next_move_number,
      movelist[idx].variations.length > 1,
      next_white_to_move,
      movelist,
      movelist[idx].variations[0]
    );
  return string;
}
 buildPgnFromMovelist(movelist) {
 return this.addmove(1, false, true, movelist, 0);
 
}
  render() {
    let moves = [];
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
      let string = this.buildPgnFromMovelist(game.variations.movelist);
      moves=string.split("|");
      moves.splice(-1,1)
      this.cmi=moves.length;
    }
    let mstyle = this.props.cssmanager.gameButtonMove();
    if (this.props.currentGame === true) {
      Object.assign(mstyle, { bottom: "26px",padding:"0px" });
    } else {
      Object.assign(mstyle, { bottom: "85px",padding:"0px" });
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
      let movestyle = (this.state.cmi === index+1 ) ? Object.assign(style, { color: "#904f4f",
        fontWeight: "bold",
        fontSize: "15px"
      
      }) : style;
    
      return (
        <span key={index}>
          {ind ? <b>{ind}</b> : null}
          <span style={movestyle}> {move}</span>
        </span>
      );
    });
    let btnstyle = {}; 
    btnstyle = this.props.cssmanager.buttonStyle();
    Object.assign(btnstyle, { background:"#f1f1f1",borderRadius:"5px",margin: "5px",padding: "6px 25px"
   });
    
    return (
      <div>
        <div style={this.props.cssmanager.gameMoveList()} >{moveslist}</div>
        {displayButton ? (
          <div style={mstyle} className="moveAction">
            <button
              style={btnstyle}
              onClick={this.moveBackwordBeginning.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("fastForward")}
                alt="fast-forward"
              />
            </button>
            <button
              style={btnstyle}
              onClick={this.moveBackword.bind(this)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("prevIconGray")}
                alt="previous"
              />
            </button>
            <button
              style={btnstyle}
              onClick={this.moveForward.bind(this)}
            >
              <img src={this.props.cssmanager.buttonBackgroundImage("nextIconGray")} alt="next" />
            </button>
            <button
              style={btnstyle}
              onClick={this.moveForwardEnd.bind(this, 1)}
            >
              <img
                src={this.props.cssmanager.buttonBackgroundImage("fastForwardNext")}
                alt="fast-forward-next"
              />
            </button>
            <button style={btnstyle}>
              <img
                src={this.props.cssmanager.buttonBackgroundImage("nextIconSingle")}
                alt="next-single"
              />
            </button>
            <button style={ btnstyle} onClick={this.props.flip}>
              <img src={this.props.cssmanager.buttonBackgroundImage("flipIconGray")} alt="Flip" />
            </button>
           {/*  <button style={btnstyle}>
              <img
                src={this.props.cssmanager.buttonBackgroundImage("settingIcon")}
                alt="setting-icon"
              />
            </button> */}
          </div>
        ) : null}
      </div>
    );
  }
}
