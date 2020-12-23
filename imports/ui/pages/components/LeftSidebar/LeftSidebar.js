import React, { Component } from "react";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import GameListModal from "./../Modaler/GameListModal";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";
import injectSheet from "react-jss";
import classNames from "classnames";

import { GameHistoryCollection, mongoCss } from "../../../../api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_LOGIN } from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { dynamicLeftSideBarStyles } from "./dynamicLeftSidebarStyles";

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
        history.push(RESOURCE_LOGIN);
      }
    });
  };

  handleMyGamesClose = () => {
    this.setState({ isMyGamesModal: false });
  };

  render() {
    const { examineAction, translate, classes } = this.props;
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
        <div className="sidebar__logo" />
        <button className="sidebar__burger-btn" onClick={this.toggleMenu} />
        <div className="sidebar__user">
          <img
            src={"../../../images/avatar.png"}
            alt="user avatar"
            className={classNames(classes.sidebarUserImg)}
          />
          <span className={classes.sidebarUsername}>{username}</span>
        </div>
        <MenuLinks
          visible={visible}
          examineAction={examineAction}
          handleRedirect={this.handleRedirect}
          onLogout={this.handleLogout}
          onMyGames={this.handleMyGames}
        />
      </div>
    );
  }
}

export default compose(
  withRouter,
  translate("Common.leftSideBar"),
  withTracker(() => {
    return {
      leftSideBarCss: mongoCss.findOne({ type: "leftSideBar" })
    };
  }),
  injectSheet(dynamicLeftSideBarStyles)
)(LeftSidebar);
