import React, { Component } from "react";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import GameListModal from "./../Modaler/GameListModal";
import { Meteor } from "meteor/meteor";

import { GameHistoryCollection } from "../../../../api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import {
  resourceCommunity,
  resourceExamine,
  resourceLogin,
  resourcePlay,
  resourceUploadPgn
} from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";

const log = new Logger("client/LeftSidebar_js");

class LeftSidebar extends Component {
  constructor(props) {
    log.trace("LeftSidebar constructor", props);
    super(props);

    this.state = {
      visible: false,
      gameList: [],
      isMyGamesModal: false
    };
  }

  toggleMenu = () => {
    this.setState(prevState => {
      return { visible: !prevState.visible };
    });
  };

  handleMyGames = () => {
    const gameList = this.loadGameList();

    this.setState({
      gameList,
      isMyGamesModal: true
    });
  };

  loadGameList = () => {
    return GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    });
  };

  handleRedirect = resource => {
    const { history } = this.props;
    history.push(resource);
  };

  handleLogout = () => {
    const { history } = this.props;

    Meteor.logout(err => {
      if (err) {
        log.error(`Error while logging out: ${err}`);
      } else {
        history.push(resourceLogin);
      }
    });
  };

  handleMyGamesClose = () => {
    this.setState({ isMyGamesModal: false });
  };

  render() {
    const { gameHistory, examineAction, translate } = this.props;
    const { visible, isMyGamesModal, gameList } = this.state;

    const username = !!Meteor.user() ? Meteor.user().username : translate("noLogin");

    log.trace("LeftSidebar render", this.props);

    return (
      <div className={visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"}>
        <GameListModal
          isImported={false}
          visible={isMyGamesModal}
          gameList={gameList}
          onClose={this.handleMyGamesClose}
        />
        <div className="sidebar__logo"/>
        <button className="sidebar__burger-btn" onClick={this.toggleMenu}/>
        <div className="sidebar__user">
          <img src={"../../../images/avatar.png"} alt="" className="sidebar__user-img"/>
          <span className="sidebar__user-name">{username}</span>
        </div>
        <MenuLinks
          visible={visible}
          gameHistory={gameHistory}
          examineAction={examineAction}
          onCommunity={() => this.handleRedirect(resourceCommunity)}
          onUploadpgn={() => this.handleRedirect(resourceUploadPgn)}
          onPlay={() => this.handleRedirect(resourcePlay)}
          onExamine={() => this.handleRedirect(resourceExamine)}
          onLogout={this.handleLogout}
          onMyGames={this.handleMyGames}
        />
      </div>
    );
  }
}

export default withRouter(translate("Common.leftSideBar")(LeftSidebar));
