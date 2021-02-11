import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { links, sidebarBottom } from "./../../hardcode.json";
import {
  labelLogout,
  labelMyGame,
  labelsToResources,
  RESOURCE_LOGIN
} from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import _ from "lodash";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import injectSheet from "react-jss";
import classNames from "classnames";
import { dynamicMenuLinksStyles } from "./dynamicMenuLinksStyles";

import "./MenuLinks.css";
import { ROLE_DEVELOPER } from "../../../../constants/systemConstants";

class MenuLinks extends Component {
  logout = () => {
    const { history } = this.props;

    Meteor.logout(err => {
      if (err) {
      } else {
        history.push(RESOURCE_LOGIN);
      }
    });
  };

  handleClick = label => {
    const { handleRedirect, onMyGames, onLogout } = this.props;

    if (labelsToResources.hasOwnProperty(label)) {
      handleRedirect(labelsToResources[label]);
    } else if (label === labelMyGame) {
      onMyGames();
    } else if (label === labelLogout) {
      onLogout();
    }
  };

  getSidebar = linksArray => {
    const { history, visible, translate, classes, currentRoles } = this.props;
    const availableRoutes = currentRoles.map(role => role?.role?._id);

    return (
      <ul className={classes.rowStyle}>
        {linksArray.map(link => {
          const isActive = _.get(history, "location.pathname") === `/${link.link}`;

          const suitableRoles = [];

          if (availableRoutes.includes(ROLE_DEVELOPER)) {
            suitableRoles.push(ROLE_DEVELOPER);
          }

          if (!link.roles || !link.roles.length) {
            suitableRoles.push("");
          } else {
            link.roles.forEach(role => {
              if (availableRoutes.includes(role)) suitableRoles.push(role);
            });
          }

          return !!suitableRoles.length ? (
            <li className={classNames(classes.menuLinkItem)} key={link.label}>
              <a
                className={classNames(
                  classes.menuItemText,
                  "menulink__item",
                  !!isActive ? classes.active : ""
                )}
                onClick={() => this.handleClick(link.label)}
              >
                <img src={link.src} alt={link.label} />
                {!visible && <span>{translate(link.label)}</span>}
              </a>
            </li>
          ) : null;
        })}
      </ul>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.menuLinks}>
        {this.getSidebar(links)}
        {this.getSidebar(sidebarBottom)}
      </div>
    );
  }
}

export default compose(
  withRouter,
  translate("Common.menuLinkLabel"),
  withTracker(() => {
    return {
      menuLinksCss: mongoCss.findOne(),
      currentRoles: Meteor.roleAssignment.find().fetch()
    };
  }),
  injectSheet(dynamicMenuLinksStyles)
)(MenuLinks);
