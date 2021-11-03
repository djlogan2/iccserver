import { notification } from "antd";
import classNames from "classnames";
import { get } from "lodash";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { GameHistoryCollection, mongoCss } from "../../../../../imports/api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import { gameStatusNone, gameStatusPlaying } from "../../../../constants/gameConstants";
import { RESOURCE_LOGIN, RESOURCE_PROFILE } from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";
import GameListModal from "../Modaler/GameListModal";
import MenuLinks from "./MenuLinks";

const log = new Logger("client/LeftSidebar_js");

class LeftSidebar extends Component {
  constructor(props) {
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
    const { translate, classes } = this.props;
    const { visible, isMyGamesModal, gameList } = this.state;
    const currentUser = Meteor.user();

    const username = !!currentUser ? currentUser.username : translate("noLogin");
    const gameStatus = get(currentUser, "status.game");

    return (
      <div className={classNames("sidebar", "left", "device-menu", !!visible && "fliph")}>
        <GameListModal
          allowDownload
          isImported={false}
          visible={isMyGamesModal}
          gameList={gameList}
          onClose={this.handleMyGamesClose}
        />
        <img
          src={visible ? "/images/JHU_logo_sm_small.png" : "/images/JHU_logo_sm.png"}
          alt={translate("logo")}
          className={classNames(classes.imageLogo, !!visible && classes.fliphImageLogo)}
        />
        <button
          className={classNames(classes.burgerButton, !!visible && classes.fliphBurgerButton)}
          title={translate("burgerButton")}
          onClick={this.toggleMenu}
        />
        <div
          id="profile-redirect"
          className={classNames(classes.sidebarUser, !!visible && classes.fliphSidebarUser)}
          onClick={() => {
            if (gameStatus !== gameStatusPlaying) {
              this.handleRedirect(RESOURCE_PROFILE);
            } else {
              notification.open({
                message: translate("notification.pleaseFinishGame"),
                description: null,
                duration: 5,
              });
            }
          }}
        >
          <img
            src={`mugshot/${Meteor.user()?.mugshot}`}
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
      currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    };
  }),
  withDynamicStyles("leftSideBarCss.leftSideBarCss")
)(LeftSidebar);

export const LeftSidebar_Pure = LeftSidebar;
