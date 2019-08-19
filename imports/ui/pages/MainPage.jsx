import React, { Component } from "react";
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
    this.state = {
      username: "",
      visible: false,
      IsBlackActive: true,
      IsWhiteActive: false,
      move: null
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        BlackPlayer: {
          Rating: "2250",
          Name: "Mac",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-top.png",
          IsActive: false
        },
        WhitePlayer: {
          Rating: "1525",
          Name: "Max",
          Flag: "us",
          Timer: 1100,
          UserPicture: "player-img-bottom.png",
          IsActive: true
        }
      },
      RightSection: {
        TournamentList: {
          Tournaments: Tournament
        },
        MoveList: {
          GameMove:
            "ce2 a6, dxc6 b4, c3 c6 , e4 d5, c3 b7, ce2 a6, c3 c6 , d4 a7, e4 d5, c3 c6 , c3 b7, c3 b7, e4 d5, e4 d5, dxc6 b4, exd5 b5,"
        }
      }
    };
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      // this.randomMoveObject();
    }, 5000);
  }

  randomMoveObject() {
    let moveList = [
      "e4 d5",
      "exd5 b5",
      "c3 c6 ",
      "dxc6 b4",
      "ce2 a6",
      "d4 a7",
      "c3 b7",
      "xb7 f4"
    ];
    let move = moveList[Math.floor(Math.random() * moveList.length)];

    this.setState({
      move: move
    });
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    // this.Main.RightSection.MoveList.GameMove = this.state.move + ", ";
    console.log("MainPage render, cssmanager=" + this.props.cssmanager);
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
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
                <LeftSidebar
                  cssmanager={this.props.cssmanager}
                  LefSideBoarData={this.Main.LeftSection}
                />
              </div>
            </aside>
          </div>
          {/* <div className="col-sm-5 col-md-8 col-lg-5 "> */}
          <div style={{ float: "left", width: w, height: h }}>
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              board={this.props.board}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
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
  /*,
    {
      name: "1|0 Bullet Arena",
      status: "in 8 min",
      count: "55",
      src: "images/bullet-icon.png"
    },
    {
      name: "15|10 Rapid Swiss",
      status: "Round 1 of 3",
      count: "25",
      src: "images/blitz-icon.png"
    },
    {
      name: "15|10 Rapid Swiss ",
      status: "Round 1 of 5",
      count: "15",
      src: "images/rapid-icon.png"
    }
    */
];
