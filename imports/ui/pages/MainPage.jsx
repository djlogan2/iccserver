import React, { Component } from "react";
import { Tracker } from "meteor/tracker";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import "./css/ChessBoard";
import "./css/leftsidebar";
import "./css/RightSidebar";
import MiddleBoard from "./MiddleSection/MiddleBoard";
import RealTime from "../../../lib/client/RealTime";
import CssManager from "../pages/components/Css/CssManager";
import { Logger, SetupLogger } from "../../../lib/client/Logger";

const css = new CssManager("developmentcss");
const log = new Logger("client/MainPage");

Meteor.subscribe("userData");

export default class MainPage extends TrackerReact(Component) {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      visible: false,
      IsBlackActive: true,
      IsWhiteActive: false,
      move: null,
      subscription: {
        tasks: Meteor.subscribe("userData")
      }
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
                  CssManager={css}
                  LefSideBoarData={this.Main.LeftSection}
                />
              </div>
            </aside>
          </div>
          {/* <div className="col-sm-5 col-md-8 col-lg-5 "> */}
          <div style={{ float: "left", width: w, height: h }}>
            <MiddleBoard
              CssManager={css}
              MiddleBoardData={this.Main.MiddleSection}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar
              CssManager={css}
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

//
// Our reactive autorun. At this point, it's sole purpose is to retrieve the realtime records being sent
// from the server, which facilitates game play, time synchronization (lag measurement), that sort of thing.
//
// In the future, we could use realtime messages for more, but in general, I want to restrict it primarily to
// game play and lag measurements...things that REQUIRE the most accurate timing, and don't really fit the
// "write to mongo, server notices, sends updates to clients" model (like, say, messages.)
//
let rm_index = 0;

function game_start() {
    console.log('game_start');
}

function game_move() {
    console.log('game_start');
}

function update_game_clock() {
    console.log('game_start');
}

Tracker.autorun(function() {
  var records = RealTime.collection
    .find({ nid: { $gt: rm_index } }, { sort: { nid: 1 } })
    .fetch();
  log.debug("Fetched " + records.length + " records from realtime_messages", {
    records: records
  });
  if (records.length) rm_index = records[records.length - 1].nid;
  records.forEach(rec => {
    log.debug("realtime_record", rec);
    rm_index = rec.nid;
    switch (rec.type) {
      case "setup_logger":
        SetupLogger.addLoggers(rec.message);
        break;

      case "game_start":
        game_start(rec);
        break;

      case "game_move":
        game_move(rec);
        break;

      case "update_game_clock":
        update_game_clock(rec);
        break;

      case "error":
      default:
        log.error("realtime_message default", rec);
    }
  });
});
