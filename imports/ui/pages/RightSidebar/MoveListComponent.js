/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../../lib/client/Logger";
import { object } from "prop-types";
const log = new Logger("MoveLIst_js");
export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    this.cmi = 0;
    this.state = {
      current: null,
      cmi:0,
      toggle:false,
      action: "action",
      examinAction: "action",
      gameRequest: props.gameRequest,
      isexamin: true
    };
  }
  static getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.game.variations.cmi!==this.props.game.variations.cmi){
        this.setState({cmi:nextProps.game.variations.cmi});
    }
    if (!!this.props.gameRequest) {
      if (
        nextProps.gameRequest !== this.props.gameRequest &&
        this.props.gameRequest.type === "match"
      ) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
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

  moveAutoForward = () => {
    clearInterval(this.intervalID);
     this.setState({toggle:!this.state.toggle});
       this.intervalID=setInterval(() =>{
         let remainMove= this.cmi-this.state.cmi;
         if(remainMove===0 || this.state.toggle===false){
                clearInterval(this.intervalID);
                if(remainMove===0)
                  this.setState({toggle:false});
                this.setState({toggle:!this.state.toggle});this.setState({toggle:!this.state.toggle});
         }else{
           this.moveForward();
         }
       
       } , 1000);
   }
  
  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
  handleChange = e => {
    this.setState({ examinAction: e.target.value });
    this.props.examineAction(e.target.value);
  };
  requestFornewOppenent() {
    this.props.examineAction("newoppent");
  }
  _takeBackAction = number => {
    Meteor.call("requestTakeback", this.message_identifier, this.gameId, number);
  };
  _drawRequest = () => {
    Meteor.call("requestToDraw", this.message_identifier, this.gameId);
  };
  _abortRequest = () => {
    Meteor.call("requestToAbort", this.message_identifier, this.gameId);
  };
  _adjournRequest = () => {
    Meteor.call("requestToAdjourn", this.message_identifier, this.gameId);
  };
  _resignGame = () => {
    Meteor.call("resignGame", this.message_identifier, this.gameId);
  };
  _reMatchGame = () => {
    let toUser;
    if (Meteor.userId() !== this.state.gameRequest.challenger_id) {
      toUser = this.state.gameRequest.challenger_id;
    } else {
      toUser = this.state.gameRequest.receiver_id;
    }
    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      toUser,
      this.state.gameRequest.wild_number,
      this.state.gameRequest.rating_type,
      this.state.gameRequest.rated,
      this.state.gameRequest.adjourned,
      this.state.gameRequest.challenger_time,
      this.state.gameRequest.challenger_inc_or_delay,
      this.state.gameRequest.challenger_delaytype,
      this.state.gameRequest.receiver_time,
      this.state.gameRequest.receiver_inc_or_delay,
      this.state.gameRequest.receiver_delaytype,
      this.state.gameRequest.challenger_color_request
    ); 
  };
  handleChangeSecond = event => {
    let action = event.target.value;
    this.setState({ action: "action" });
    switch (action) {
      case "halfMove":
        this._takeBackAction(1);
        break;
      case "fullMove":
        this._takeBackAction(2);
        break;
      case "abort":
        this._abortRequest();
        break;
      default:
    }
  };
  _setGameToExamine() {
    this.props.startGameExamine();
  }
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
    let translator = i18n.createTranslator("Common.MoveListComponent", MoveListComponent.getLang());
    let moves = [];
    let variation;
    let game = this.props.game;
    let status = this.props.game.status;
    if(!!game){
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }
    
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

    /* TODO: movlist button display operation*/
    let displayButton = 1;
    let isPlaying;
    if (this.props.currentGame === false && status === "examining"){
      displayButton = 0;
    } 
    let mbtnstyle = this.props.cssmanager.gameButtonMove();
    if (this.props.currentGame === true || status === "playing") {
      Object.assign(mbtnstyle, { bottom: "85px",padding:"0px" });
     } else {
      Object.assign(mbtnstyle, { bottom: "26px",padding:"0px" }); 
    }
    if (status === "playing") {
      isPlaying=true;
    }else{
      isPlaying=false;
    }
   
    /*End of code */
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
          <div style={mbtnstyle} className="moveAction">
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
            <button style={btnstyle}  onClick={this.moveAutoForward.bind(this)}>
            {this.state.toggle?( 
             <img
             src={this.props.cssmanager.buttonBackgroundImage("nextStop")}
             alt="next-single"
           />):( 
              <img
              src={this.props.cssmanager.buttonBackgroundImage("nextStart")}
              alt="next-single"
            />)}
              
               
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
           <div className="draw-section">
           {displayButton ? (
          <div style={this.props.cssmanager.drawActionSection()}>
            {translator("Gamestatus")}: {translator(status)}
          </div>
        ) : null}
            
          {isPlaying?( <ul>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                style={this.props.cssmanager.buttonStyle()}
                onClick={this._drawRequest.bind(this)}
              >
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("draw")}
                  alt="Draw"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                {translator("draw")}
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                style={this.props.cssmanager.buttonStyle()}
                onClick={this._resignGame.bind(this)}
              >
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("resign")}
                  alt="Resign"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                {translator("resign")}
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <span style={this.props.cssmanager.spanStyle("form")}>
                <select
                  onChange={this.handleChangeSecond}
                  style={{
                    outline: "none",
                    border: "1px #9c9c9c solid",
                    padding: "6px 3px",
                    borderRadius: "5px",
                    marginTop: "7px"
                  }}
                  value={this.state.action}
                >
                  <option value="action">Action</option>
                  <option value="abort">Abort</option>
                  <option value="halfMove">TakeBack 1 Move</option>
                  <option value="fullMove">TakeBack 2 Moves</option>
                  <option value="flag">Flag</option>
                  <option value="moretime">Moretime</option>
                  <option value="adjourn">Adjourn</option>
                </select>
              </span>
            </li>
          </ul>):( <ul>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                onClick={() => this.requestFornewOppenent()}
                style={this.props.cssmanager.buttonStyle()}
              >
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("draw")}
                  alt="Draw"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                New Oppenent
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                onClick={this._reMatchGame.bind(this)}
                style={this.props.cssmanager.buttonStyle()}
              >
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("resign")}
                  alt="Resign"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                Rematch
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <button
                style={this.props.cssmanager.buttonStyle()}
                onClick={() => this._setGameToExamine()}
              >
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("examine")}
                  alt="examine"
                  style={this.props.cssmanager.drawSectionButton()}
                />
                Examine
              </button>
            </li>
            <li style={this.props.cssmanager.drawSectionList()}>
              <span style={this.props.cssmanager.spanStyle("form")}>
                <select
                  style={{
                    outline: "none",
                    border: "1px #9c9c9c solid",
                    padding: "6px 3px",
                    borderRadius: "5px",
                    marginTop: "7px",
                    width: "150px"
                  }}
                  value={this.state.examinAction}
                  onChange={this.handleChange}
                >
                  <option value="action">Action</option>
                  <option value="addgame">Add Game To Library</option>
                  <option value="complain">Complain About This Game</option>
                  <option value="emailgame">Email Game</option>
                </select>
              </span>
            </li>
          </ul>)}  
          
      </div>
      </div>
    );
  }
}
