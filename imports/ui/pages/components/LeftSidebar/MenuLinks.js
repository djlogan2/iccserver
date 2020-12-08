import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { links, sidebarBottom } from "./../../hardcode.json";
import {
  labelLogout,
  labelMyGame,
  labelsToResources,
  resourceLogin,
} from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import _ from "lodash";

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
                <img src={link.src} alt={link.label} />
                {!visible && <span>{translate(link.label)}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    );
  };

  render() {
    return (
      <div className="menu-links">
        <ul className="list-sidebar bg-defoult list-unstyled components desktop">
          {this.getSidebar(links)}
        </ul>
        <div className="menu-links__bottom">{this.getSidebar(sidebarBottom)}</div>
      </div>
    );
  }
}

export default withRouter(translate("Common.menuLinkLabel")(MenuLinks));
