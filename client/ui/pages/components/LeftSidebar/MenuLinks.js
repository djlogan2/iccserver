import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { links, sidebarBottom } from "../../hardcode.json";
import {
  labelLogout,
  labelMyGame,
  labelsToResources,
  RESOURCE_LOGIN,
} from "../../../../constants/resourceConstants";
import { translate } from "../../../HOCs/translate";
import _ from "lodash";
import { Tag, Tooltip } from "antd";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import classNames from "classnames";
import { dynamicMenuLinksStyles } from "./dynamicMenuLinksStyles";
import { serverTS } from "../../../../../lib/client/timestamp";
import SettingOutlined from "@ant-design/icons/SettingOutlined";

import "./MenuLinks.css";
import { ROLE_DEVELOPER } from "../../../../constants/systemConstants";

class MenuLinks extends Component {
  constructor(props) {
    super(props);
    this.state = { lastping: 0, averageping: 0, lagging: 0 };
    this.pings = [];
    Meteor.call("current_release", (error, result) => {
      this.setState({ current_release: result });
    });
    Meteor.call("current_commit", (error, result) => {
      this.setState({ current_commit: result });
    });
    this.lagging = () => {
      this.setState({ lagging: this.state.lagging + 1 });
    };
    this.sendingPingResult = (result) => {
      if (this.pings.length >= 60) this.pings.shift();
      this.pings.push(result.delay);
      const average = this.pings.reduce((sum, val) => sum + val, 0) / this.pings.length;
      this.setState({
        lastping: result.delay,
        averageping: average,
        lagging: 0,
      });
    };
  }

  componentDidMount() {
    serverTS().events.on("sendingPingResult", this.sendingPingResult);
    serverTS().events.on("lagFunc", this.lagging);
  }

  componentWillUnmount() {
    serverTS().events.removeListener("sendingPingResult", this.sendingPingResult);
    serverTS().events.removeListener("lagFunc", this.lagging);
  }

  logout = () => {
    const { history } = this.props;

    Meteor.logout((err) => {
      if (err) {
      } else {
        history.push(RESOURCE_LOGIN);
      }
    });
  };

  handleClick = (label) => {
    const { handleRedirect, onMyGames, onLogout } = this.props;

    if (labelsToResources.hasOwnProperty(label)) {
      handleRedirect(labelsToResources[label]);
    } else if (label === labelMyGame) {
      onMyGames();
    } else if (label === labelLogout) {
      onLogout();
    }
  };

  connectionStatus = () => {
    let ping_color;
    let average_color;

    if (!!this.state.lagging || this.state.lastping > 500) {
      ping_color = "red";
    } else if (this.state.lastping > 200) {
      ping_color = "gold";
    } else {
      ping_color = "green";
    }

    if (!!this.state.lagging || this.state.averageping > 500) {
      average_color = "red";
    } else if (this.state.averageping > 200) {
      average_color = "gold";
    } else {
      average_color = "green";
    }

    const release_information = (
      <table>
        <tbody>
          <tr>
            <td>{Meteor.default_connection._lastSessionId}</td>
          </tr>
          <tr>
            <td>{Meteor.current_release}</td>
          </tr>
          <tr>
            <td>{Meteor.current_commit}</td>
          </tr>
          <tr>
            <td>{this.state.current_release}</td>
          </tr>
          <tr>
            <td>{this.state.current_commit}</td>
          </tr>
        </tbody>
      </table>
    );
    return (
      <table width="100%">
        <tbody>
          <tr>
            <td>
              <Tooltip title={this.props.translate("last_ping")}>
                <Tag style={{ width: "100%", textAlign: "right" }} color={ping_color}>
                  {!!this.state.lagging
                    ? "Disconnected " + this.state.lagging + "s"
                    : this.state.lastping}
                </Tag>
              </Tooltip>
            </td>
            {!this.state.lagging && (
              <td>
                <Tooltip title={this.props.translate("average_lag")}>
                  <Tag style={{ width: "100%", textAlign: "right" }} color={average_color}>
                    {Math.round(this.state.averageping)}
                  </Tag>
                </Tooltip>
              </td>
            )}
            <td style={{ textAlign: "center" }}>
              <Tooltip title={release_information}>
                <SettingOutlined style={{ color: "white" }} />
              </Tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  getSidebar = (linksArray) => {
    const { history, visible, translate, classes, currentRoles } = this.props;

    const availableRoutes = currentRoles.map((role) => role?.role?._id);

    const cf = Meteor.user()?.cf;
    const isChildChat = cf && cf.indexOf("c") !== -1 && cf.indexOf("e") === -1;

    return (
      <ul className={classes.rowStyle}>
        {linksArray.map((link) => {
          const isActive = _.get(history, "location.pathname") === `/${link.link}`;

          const suitableRoles = [];

          if (link.roles.includes("community_chat") && !isChildChat) {
            suitableRoles.push("community_chat");
          }

          if (availableRoutes.includes(ROLE_DEVELOPER)) {
            suitableRoles.push(ROLE_DEVELOPER);
          }

          if (!link.roles || !link.roles.length) {
            suitableRoles.push("");
          } else {
            link.roles.forEach((role) => {
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
        <div className={classes.topMenuLinks}>
          {this.getSidebar(links)}
          {this.getSidebar(sidebarBottom)}
        </div>
        {this.connectionStatus()}
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
      currentRoles: Meteor.roleAssignment.find().fetch(),
    };
  }),
  injectSheet(dynamicMenuLinksStyles)
)(MenuLinks);
