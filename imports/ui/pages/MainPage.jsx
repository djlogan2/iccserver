import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import "./css/ChessBoard";
import "./css/leftsidebar";
import "./css/RightSidebar";
import MiddleBoard from "./MiddleSection/MiddleBoard";
import { Logger } from "../../../lib/client/Logger";
const log = new Logger("client/MainPage");

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    (this.gameId = null),
      (this.state = {
        username: "",
        visible: false,
        startgame: false,
        aborted: false,
        resigned: false,
        draw:false,
        move: null
      });
    this.toggleMenu = this.toggleMenu.bind(this);
    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        BlackPlayer: {
          Rating: "0000",
          Name: "Player-1",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-top.png",
          IsActive: false
        },
        WhitePlayer: {
          Rating: "0000",
          Name: "Player-2",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-bottom.png",
          IsActive: false
        }
      },
      RightSection: {
        TournamentList: {
          Tournaments: Tournament
        },
        MoveList: {
          GameMove: ""
        },
        Action:{}
      }
    };
    
  }
 

  getInformativePopup=(title,param )=>{
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3>{title}</h3>
          <button
            onClick={this.hideInformativePopup.bind(this,param)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            close me
          </button>
        </div>
      </div>
    ) 
    
  }
  actionPopup=(title, action)=>{
    
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3>{title}</h3>
          
          <button
            onClick={this._performAction.bind(this,"accepted",action,this.userId)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Accept
          </button>
          <button
            onClick={this._performAction.bind(this,"rejected",action,this.userId)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            cancel
          </button>
        </div>
      </div>
    );
  }
  _pieceSquareDragStop = raf => {
    this.props.onDrop({
      from: raf.from,
      to: raf.to
    });
  };
  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };
  _performAction = (actionType, action,actionBy) => {
     
      Meteor.call("execute-game-action", this.gameId, actionType, action,actionBy);    
  };  
  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }
  
hideInformativePopup(param) {
        if(param==="startgame"){
          this.setState({startgame: true,resigned:false,aborted:false,draw:false});  
        }else if(param==="resigned"){
          this.setState({resigned: true,startgame:false,aborted:false,draw:false});  
        }else if(param==="aborted"){
          this.setState({aborted: true,startgame:false,startgame:false,draw:false});  
        }else if(param==="draw"){
          this.setState({draw:false,aborted: false,startgame:false,startgame:false});  
        }
}
  render() {
    let gameTurn = this.props.board.turn();
    let gamedata=this.props.player;
    let informativePopup = null;
    let actionPopup=null;
    if (
      this.props.move !== this.Main.RightSection.MoveList.GameMove &&
      this.props.move !== ""
    ) {
      this.Main.RightSection.MoveList.GameMove = "";
      this.Main.RightSection.MoveList.GameMove = this.props.move + ",";
    }
    if (gamedata !== undefined ) {
     
      this.gameId = this.props.player._id;
      this.Main.MiddleSection.BlackPlayer.Name = this.props.player.black.name;
      this.Main.MiddleSection.WhitePlayer.Name = this.props.player.white.name;
      this.Main.MiddleSection.BlackPlayer.Timer = this.props.player.black.time;
      this.Main.MiddleSection.WhitePlayer.Timer = this.props.player.white.time;
      if (gameTurn === "w") {
        this.Main.MiddleSection.BlackPlayer.IsActive = false;
        this.Main.MiddleSection.WhitePlayer.IsActive = true;
      } else {
        this.Main.MiddleSection.BlackPlayer.IsActive = true;
        this.Main.MiddleSection.WhitePlayer.IsActive = false;
      }
      this.userId= Meteor.userId();
      this.Main.RightSection.MoveList.GameMove = this.props.player;
      this.Main.RightSection.Action.userId =this.userId
      this.Main.RightSection.Action.user = Meteor.user().username;
      this.Main.RightSection.Action.gameTurn = gameTurn;
      this.Main.RightSection.Action.whitePlayer=this.props.player.white.name;
      this.Main.RightSection.Action.blackPlayer=this.props.player.black.name;
      this.Main.RightSection.Action.gameId=this.gameId;

      let actions = this.props.player.actions;
      if (actions !== undefined && actions.length !== 0) {
        let action = actions[actions.length - 1];
        
        if (action["type"] === "takeBack" && action["value"]==="request") {
          if (gameTurn === "w" && this.props.player.white.name===Meteor.user().username) {
              actionPopup=this.actionPopup(this.props.player.black.name + " has requested to Take back","takeBack");
          } else if(gameTurn==="b" && this.props.player.black.name===Meteor.user().username){
            actionPopup=this.actionPopup(this.props.player.white.name + " has requested to Take back","takeBack");
           }
        }else if(action["type"] === "draw" && action["value"]==="request"){
          if (gameTurn === "b" && this.props.player.white.name===Meteor.user().username) {
            actionPopup=this.actionPopup(this.props.player.white.name + " has requested to draw","draw");
          } else if(gameTurn==="w" && this.props.player.black.name===Meteor.user().username){
            actionPopup=this.actionPopup(this.props.player.black.name + " has requested to draw","draw");
         }
        }else if(action["type"] === "resigned"){
             informativePopup=null;
             if (action["actionBy"]!==this.userId  && this.state.resigned===false) {
                   informativePopup=this.getInformativePopup("opponent has resigned","resigned");
              }
              this.Main.MiddleSection.BlackPlayer.Name = "Player-1";
              this.Main.MiddleSection.WhitePlayer.Name = "Player-2";
              this.Main.MiddleSection.BlackPlayer.Timer = 1000;
              this.Main.MiddleSection.WhitePlayer.Timer = 1000;
              this.Main.MiddleSection.WhitePlayer.IsActive= false;
              this.Main.MiddleSection.BlackPlayer.IsActive= false;
             
        }else if(action["type"] === "aborted" && action["value"]==="request"){
         
             if (action["actionBy"]!==this.userId  && this.state.resigned===false) {
              if (gameTurn === "w"){
                  actionPopup=this.actionPopup(this.props.player.white.name + "Request to abort","aborted");
              }else{
                  actionPopup=this.actionPopup(this.props.player.black.name + "Request to abort","aborted");
              }
                
              }
        }else if(action["type"] === "aborted" && action["value"]==="accepted"){
          if(action["actionBy"]!==this.userId && this.state.aborted==false){
            informativePopup=this.getInformativePopup("Game is aborted","aborted");
          }
            
            this.Main.MiddleSection.BlackPlayer.Name = "Player-1";
            this.Main.MiddleSection.WhitePlayer.Name = "Player-2";
            this.Main.MiddleSection.BlackPlayer.Timer = 1000;
            this.Main.MiddleSection.WhitePlayer.Timer = 1000;
            this.Main.MiddleSection.WhitePlayer.IsActive= false;
            this.Main.MiddleSection.BlackPlayer.IsActive= false;
         }else if(action["type"] === "draw" && action["value"]==="accepted"){
            if(action["actionBy"]!==this.userId && this.state.draw==false){
              informativePopup=this.getInformativePopup("Game is draw","draw");
            }
            
            this.Main.MiddleSection.BlackPlayer.Name = "Player-1";
            this.Main.MiddleSection.WhitePlayer.Name = "Player-2";
            this.Main.MiddleSection.BlackPlayer.Timer = 1000;
            this.Main.MiddleSection.WhitePlayer.Timer = 1000;
            this.Main.MiddleSection.WhitePlayer.IsActive= false;
            this.Main.MiddleSection.BlackPlayer.IsActive= false;
          }
         
         

      }
    }
    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }

    // this.Main.RightSection.MoveList.GameMove = this.state.move + ", ";
    log.debug("MainPage render, cssmanager=" + this.props.cssmanager);
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;

    if (
      this.props.player !== undefined &&
      this.state.startgame === false &&
      this.props.player.black.name === Meteor.user().username
    ) {
      if (this.props.player.moves.length === 0) {
          informativePopup=this.getInformativePopup("Your Game started","startgame");
      }
    }
   
    return (
      <div className="main">
        <div className="row">
          <div className="col-sm-2 left-col">
            <aside>
              <div
                className={
                  this.state.visible
                    ? "sidebar left device-menu fliph"
                    : "sidebar left device-menu"
                }
              >
                <div className="pull-left image">
                  <img src="../../../images/logo-white-lg.png" alt="" />
                </div>
                <button
                  style={this.props.cssmanager.buttonStyle(buttonStyle)}
                  onClick={this.toggleMenu}
                >
                  <img
                    src={this.props.cssmanager.buttonBackgroundImage(
                      "toggleMenu"
                    )}
                    style={this.props.cssmanager.toggleMenuHeight()}
                    alt="toggle menu"
                  />
                </button>
                <LeftSidebar
                  cssmanager={this.props.cssmanager}
                  LefSideBoarData={this.Main.LeftSection}
                />
              </div>
            </aside>
          </div>

          <div
            className="col-sm-6 col-md-6"
            style={this.props.cssmanager.parentPopup(h, w)}
          >
            {informativePopup}
            {actionPopup}
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this._pieceSquareDragStop}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
              flip={this._flipboard}
              performAction={this._performAction}
              actionData={this.Main.RightSection.Action}
            />
          </div>
        </div>
      </div>
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
};

let links = [
  {
    label: "play",
    link: "#home",
    src: "../../../images/play-icon-white.png",
    active: true
  },
  {
    label: "learn",
    link: "#learn",
    src: "../../../images/learning-icon-white.png"
  },
  {
    label: "connect",
    link: "#connect",
    src: "../../../images/connect-icon-white.png"
  },
  {
    label: "examine",
    link: "#examine",
    src: "../../../images/examine-icon-white.png"
  },
  {
    label: "topPlayers",
    link: "#top-players",
    src: "../../../images/top-player-icon-white.png"
  },
  {
    label: "logIn",
    link: "#log-in",
    src: "../../../images/login-icon-white.png"
  },
  {
    label: "singUp",
    link: "#sign-up",
    src: "../../../images/signup-icon-white.png"
  },
  {
    label: "help",
    link: "#help",
    src: "../../../images/help-icon-white.png"
  }
];
let Tournament = [
  {
    name: "3|2 Blitz Arena",
    status: "Round 1 of 5",
    count: "15",
    src: "images/blitz-icon.png"
  },
  {
    name: "1|0 Bullet Arena",
    status: "in 4 min",
    count: "40 ",
    src: "images/rapid-icon.png"
  },
  {
    name: "15|10 Rapid Swiss ",
    status: "Round 1 of 5",
    count: "54",
    src: "images/bullet-icon.png"
  },
  {
    name: "1|0 Bullet Arena",
    status: "Round 1 of 5",
    count: "35",
    src: "images/blitz-icon.png"
  },
  {
    name: "3|2 Blitz Arena",
    status: "Round 1 of 7",
    count: "49",
    src: "images/rapid-icon.png"
  }
];
