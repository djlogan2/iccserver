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
import { serverTS } from "../../../../../lib/client/timestamp";

import "./MenuLinks.css";
import { ROLE_DEVELOPER } from "../../../../constants/systemConstants";

class MenuLinks extends Component {
  constructor(props) {
    super(props);
    this.state = { lastping: 0, averageping: 0 };
    this.pings = [];
    this.sendingPingResult = result => {
      if (this.pings.length >= 60) this.pings.shift();
      this.pings.push(result.delay);
      const average = this.pings.reduce((sum, val) => sum + val, 0) / this.pings.length;
      this.setState({ lastping: result.delay, averageping: average });
    };
  }

  componentDidMount() {
    serverTS().events.on("sendingPingResult", this.sendingPingResult);
  }
  componentWillUnmount() {
    serverTS().events.removeListener("sendingPingResult", this.sendingPingResult);
  }

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

  //djl
  connectionStatus = () => {
    if(!this.props.currentRoles.some(role => role.role._id === "developer")) return <div/>;
    const ping_style = { margin: "0px", width: "100%" };
    const average_style = { margin: "0px", width: "100%" };

    if (this.state.lastping > 500) {
      ping_style.color = "black";
      ping_style.backgroundColor = "red";
    } else if (this.state.lastping > 200) {
      ping_style.color = "black";
      ping_style.backgroundColor = "yellow";
    } else {
      ping_style.color = "white";
      ping_style.backgroundColor = "green";
    }

    if (this.state.averageping > 500) {
      average_style.color = "black";
      average_style.backgroundColor = "red";
    } else if (this.state.averageping > 200) {
      average_style.color = "black";
      average_style.backgroundColor = "yellow";
    } else {
      average_style.color = "white";
      average_style.backgroundColor = "green";
    }

    return (
      <table width="100%">
        <tbody>
        <tr><td><p style={{ margin: "0px", width: "100%", color: "white" }}>Connection ID: {Meteor.default_connection._lastSessionId}</p></td></tr>
        <tr><td><p style={ping_style}>Ping time: {this.state.lastping}</p></td></tr>
        <tr><td><p style={average_style}>Average lag: {Math.round(this.state.averageping)}</p></td></tr>
        </tbody>
      </table>
    );
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
        {this.connectionStatus()}
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
