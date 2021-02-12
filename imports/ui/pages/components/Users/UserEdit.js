import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import AppWrapper from "../AppWrapper";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";
import { Col, Space, Spin } from "antd";
import DetailsCard from "./DetailsCard";
import SecurityCard from "./SecurityCard";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import { ROLE_LIST_USERS } from "../../../../constants/systemConstants";
import injectSheet from "react-jss";
import { dynamicUserManagementStyles } from "./dynamicUserManagementStyles";

const log = new Logger("client/UserManagement_js");

class UserEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
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
    }
  }

  render() {
    const { roles, classes } = this.props;
    const { user } = this.state;

    const scope = roles.find(element => {
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
            <SecurityCard currentUser={user} />
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
      css: mongoCss.findOne()
    };
  }),
  withRouter,
  injectSheet(dynamicUserManagementStyles)
)(UserEdit);
