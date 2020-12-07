import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import ModalContext from "./../../ModalContext";
import { links, sidebarBottom } from "./../../hardcode.json";
import { resourceLogin } from "../../../../constants/resourceConstants";
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
    const { onCommunity, onUploadpgn, onPlay, onExamine, onMyGames, onLogout } = this.props;

    if (label === "community") {
      onCommunity();
    } else if (label === "uploadpgn") {
      onUploadpgn();
    } else if (label === "play") {
      onPlay();
    } else if (label === "examine") {
      onExamine();
    } else if (label === "mygame") {
      onMyGames();
    } else if (label === "logout") {
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
