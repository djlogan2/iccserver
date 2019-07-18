import React from "react";
import PropTypes from "prop-types";
import Leftsidebar from "./Leftsidebar/Leftsidebar";
import Rightsidebar from "./Rightsidebar/Rightsidebar";
import "./css/chessbord1";
import "./css/leftsidebar";
import "./css/rightsidebar";
import Game from "../pages/components/Game";
import RealTime from "../../../lib/client/RealTime";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import { Meteor } from "meteor/meteor";

export default class MainPage extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this._game = React.createRef();
    this.state = {
      username: "",
      visible: false,
      subscription: {
        tasks: Meteor.subscribe("userData")
      }
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  static gameStartData() {
    let records = RealTime.find().fetch();
    if (records.length) {
      return records;
    }
  }

  getingData() {
    let gameinfo = [];
    let rm_index = 1;
    let records = RealTime.find(
      { nid: { $gt: rm_index } },
      { sort: { nid: 1 } }
    ).fetch();
    //  let records = RealTime.find().fetch();

    if (records.length)
      // this.setState({ rm_index: records[records.length - 1].nid });

      records.map(rec => {
        rm_index = rec.nid;
        switch (rec.type) {
          case "setup_logger":
            gameinfo = rec;
            break;

          case "game_start":
            this.setState();
            gameinfo = rec;
            break;

          case "game_move":
            gameinfo = rec;
            break;

          case "update_game_clock":
            gameinfo = rec;
            break;
          default:
          //             log.error('realtime_message default', rec);
        }
      });

    return gameinfo;
  }

  render() {
    let currentUser = this.props.currentUser;
    let userDataAvailable = currentUser !== undefined;
    // const gamedata=this.getingData();
    const gameStart = MainPage.gameStartData();

    return (
      <div className="main">
        {/*     <header className="header chess-header">
          <nav className="navbar navbar-toggleable-md navbar-light pt-0 pb-0 ">
            <div className="pull-right top-right-menu-icons-group">
              <div className="top-menu-list">
                <img src="images/share-icon.png" alt="" />
              </div>
              <div className="top-menu-list">
                <img src="images/play-icon-white.png" alt="" />
              </div>
              <div className="top-menu-list">
                <img src="images/notification-icon.png" alt="" />
              </div>
              <div className="top-menu-list">
                <img src="images/setting-icon-white.png" alt="" />
              </div>
            </div>
          </nav>
        </header>
     */}
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
                  <img src="images/logo-white-lg.png" />
                </div>
                <div className="float-right menu-close-icon">
                  <a onClick={this.toggleMenu} href="#" className="button-left">
                    <span className="fa fa-fw fa-bars " />
                  </a>
                </div>
                <Leftsidebar />
              </div>
            </aside>
          </div>
          <div className="col-sm-5 col-md-8 col-lg-5 board-section">
            <Game gameStart={gameStart} ref={this._game} />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <Rightsidebar />
          </div>
        </div>
      </div>
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
};
