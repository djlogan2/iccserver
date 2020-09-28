import React, { Component } from "react";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import GameListModal from "./../Modaler/GameListModal";
import { Meteor } from "meteor/meteor";

import { GameHistoryCollection } from "../../../../api/client/collections";

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
    return GameHistoryCollection.findOne({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    });
  }

  handleExamine = () => {
    this.props.history.push("/examine");
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
    const username = !!Meteor.user() ? Meteor.user().username : "Please login";
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
        <div className="sidebar__user">
          <img src={"../../../images/avatar.png"} alt="" className="sidebar__user-img" />
          <span className="sidebar__user-name">{username}</span>
        </div>
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
