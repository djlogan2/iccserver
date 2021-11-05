import { Col, Space, Spin } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";
import { ROLE_LIST_USERS } from "../../../../constants/systemConstants";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";
import AppWrapper from "../AppWrapper/AppWrapper";
import DetailsCard from "./DetailsCard";
import SecurityCard from "./SecurityCard";

const log = new Logger("client/UserManagement_js");

class UserEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentGroup: null,
      isolationGroups: [],
    };
  }

  componentDidMount() {
    const { match, history } = this.props;
    const username = match?.params?.username;

    if (username) {
      Meteor.call("listUsers", "list_users_user_edit", 0, 1, username, (err, results) => {
        if (err) {
          log.error(err);
          history.push(RESOURCE_USERS);
        }

        this.setState({ user: results.userList[0] });
      });

      Meteor.call("listIsolationGroups", "listIsolationGroups", (err, results) => {
        if (err) {
          log.error(err);
          history.push(RESOURCE_USERS);
        }

        const isolationGroups = results.map((result) => {
          return {
            value: result,
            label: result,
          };
        });
        this.setState({ isolationGroups });
      });
    }
  }

  render() {
    const { roles, classes } = this.props;
    const { user, isolationGroups } = this.state;

    const scope = roles.find((element) => {
      if (element?.role?.id === ROLE_LIST_USERS) {
        return !!element.scope ? element.scope : null;
      }

      return false;
    });

    return (
      <AppWrapper>
        {user ? (
          <div className={classes.editMainDiv}>
            <DetailsCard scope={scope} currentUser={user} />
            <SecurityCard currentUser={user} isolationGroups={isolationGroups} />
          </div>
        ) : (
          <Col span={24} className="loading__sidebar">
            <Space size="middle">
              <Spin size="large" />
            </Space>
          </Col>
        )}
      </AppWrapper>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      roles: Meteor.roleAssignment.find().fetch(),
      css: mongoCss.findOne(),
    };
  }),
  withRouter,
  withDynamicStyles("css.userManagementCss")
)(UserEdit);
