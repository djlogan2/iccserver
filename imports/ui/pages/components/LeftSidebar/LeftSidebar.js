import React, { Component } from "react";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";
import injectSheet from "react-jss";
import classNames from "classnames";
import { get } from "lodash";
import { withTracker } from "meteor/react-meteor-data";

import MenuLinks from "./MenuLinks";
import GameListModal from "./../Modaler/GameListModal";
import { GameHistoryCollection, mongoCss } from "../../../../api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_LOGIN, RESOURCE_PROFILE } from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import { dynamicLeftSideBarStyles } from "./dynamicLeftSidebarStyles";
import { gameStatusNone } from "../../../../constants/gameConstants";

const log = new Logger("client/LeftSidebar_js");

class LeftSidebar extends Component {
  constructor(props) {
    log.trace("LeftSidebar constructor", props);
    super(props);

    this.state = {
      visible: false,
      gameList: [],
      isMyGamesModal: false,
    };
  }

  toggleMenu = () => {
    this.setState((prevState) => {
      return { visible: !prevState.visible };
    });
  };

  handleMyGames = () => {
    const gameList = this.loadGameList();

    this.setState({
      gameList,
      isMyGamesModal: true,
    });
  };

  loadGameList = () => {
    return GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }],
    });
  };

  handleRedirect = (resource) => {
    const { history } = this.props;
    history.push(resource);

    Meteor.call(
      "setClientStatus",
      "set_client_status",
      Meteor.userId(),
      resource.substring(1),
      (err) => {
        if (err) {
          log.error(err);
        }
      }
    );
  };

  handleLogout = () => {
    const { history } = this.props;

    Meteor.logout((err) => {
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

    const currentUser = Meteor.user();
    const username = !!currentUser ? currentUser.username : translate("noLogin");
    const gameStatus = get(currentUser, "status.game");

    return (
      <div className={visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"}>
        <GameListModal
          isImported={false}
          visible={isMyGamesModal}
          gameList={gameList}
          onClose={this.handleMyGamesClose}
        />
        <img
          src={visible ? "/images/JHU_logo_sm_small.png" : "/images/JHU_logo_sm.png"}
          alt={translate("logo")}
          className="sidebar__img_logo"
        />
        <button
          className="sidebar__burger-btn"
          title={translate("burgerButton")}
          onClick={this.toggleMenu}
        />
        <div className="sidebar__user" onClick={() => this.handleRedirect(RESOURCE_PROFILE)}>
          <img
            src="/images/avatar.png"
            alt={translate("userAvatar")}
            className={classNames(
              !!visible ? classes.sidebarUserImgFliphed : classes.sidebarUserImg
            )}
          />
          {!visible && (
            <>
              <span
                className={
                  gameStatus !== gameStatusNone
                    ? classes.sidebarUsername
                    : classes.sidebarUsernameNone
                }
                title={username}
              >
                {username}
              </span>
              {gameStatus !== gameStatusNone && (
                <span
                  className={classes.statusLabel}
                  title={translate(`statuses.${gameStatus}Tooltip`)}
                >
                  {translate(`statuses.${gameStatus}`)}
                </span>
              )}
            </>
          )}
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
      leftSideBarCss: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicLeftSideBarStyles)
)(LeftSidebar);
