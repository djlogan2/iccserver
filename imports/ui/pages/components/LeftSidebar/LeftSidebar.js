import React, { Component } from "react";
import { Modal } from "antd";
import moment from "moment";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import GameListModal from "./../Modaler/GameListModal";
import { Meteor } from "meteor/meteor";

import {
  ClientMessagesCollection,
  Game,
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../../../api/client/collections";

class LeftSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      gameList: [],
      isMyGamesModal: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  handleCommunity = () => {
    this.props.history.push("/community");
  };

  handleUploadpgn = () => {
    this.props.history.push("/upload-pgn");
  };

  handlePlay = () => {
    this.props.history.push("/play");
  };

  handleMyGames = () => {
    let gameList = this.loadGameList();

    this.setState({
      isMyGamesModal: true,
      gameList: gameList
    });
  };

  loadGameList(data) {
    // if (data === "mygame") {
    const gameList = GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch();
    return gameList;
  }

  handleExamine = () => {
    this.props.history.push("/examine");
    // Meteor.call(
    //   "startLocalExaminedGame",
    //   "startlocalExaminedGame",
    //   "Mr white",
    //   "Mr black",
    //   0,
    //   (error, response) => {
    //     if (response) {
    //       this.props.history.push('/examine');
    //       // this.props.examineAction(action);
    //     }
    //   }
    // );
  };

  handleLogout = () => {
    Meteor.logout(err => {
      if (err) {
      } else {
        window.location.href = "/login";
      }
    });
  };

  handleMyGamesClose = () => {
    this.setState({ isMyGamesModal: false });
  };

  render() {
    return (
      <div
        className={
          this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
        }
      >
        <GameListModal
          visible={this.state.isMyGamesModal}
          gameList={this.state.gameList}
          onClose={this.handleMyGamesClose}
        />
        <div className="sidebar__logo" />
        <button className="sidebar__burger-btn" onClick={this.toggleMenu} />
        {this.props.user && (
          <div className="sidebar__user">
            <img src="" alt="" className="sidebar__user-img" />
            <span className="sidebar__user-name">{this.props.user.username}</span>
          </div>
        )}
        <MenuLinks
          onCommunity={this.handleCommunity}
          onUploadpgn={this.handleUploadpgn}
          onPlay={this.handlePlay}
          onExamine={this.handleExamine}
          onLogout={this.handleLogout}
          onMyGames={this.handleMyGames}
          history={this.props.history}
          gameHistory={this.props.gameHistory}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
export default withRouter(LeftSidebar);
