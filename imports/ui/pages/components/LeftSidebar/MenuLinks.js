import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { links, sidebarBottom } from "./../../hardcode.json";
import {
  labelLogout,
  labelMyGame,
  labelsToResources,
  resourceLogin
} from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import _ from "lodash";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import injectSheet from "react-jss";
import { dynamicMenuLinksStyles } from "./dynamicMenuLinksStyles";

class MenuLinks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: Meteor.userId() !== null
    };
  }

  logout = () => {
    const { history } = this.props;

    Meteor.logout(err => {
      if (err) {
      } else {
        history.push(resourceLogin);
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
    const { history, visible, translate } = this.props;

    return (
      <ul className="list-sidebar bg-defoult list-unstyled components desktop">
        {linksArray.map(link => {
          const isActive = _.get(history, "location.pathname") === `/${link.link}`;

          return (
            <li className="menu-link__item" key={link.label}>
              <a
                href="#"
                className={!!isActive ? "active" : ""}
                onClick={() => this.handleClick(link.label)}
              >
                <img src={link.src} alt={link.label}/>
                {!visible && <span>{translate(link.label)}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.menuLinks}>
        <ul className="list-sidebar bg-defoult list-unstyled components desktop">
          {this.getSidebar(links)}
        </ul>
        <div className="menu-links__bottom">{this.getSidebar(sidebarBottom)}</div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  translate("Common.menuLinkLabel"),
  withTracker(() => {
    return {
      menuLinksCss: mongoCss.findOne({ type: "menuLinks" })
    };
  }),
  injectSheet(dynamicMenuLinksStyles)
)(MenuLinks);
