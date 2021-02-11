import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";

import AppWrapper from "../AppWrapper";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";
import { Col, Space, Spin } from "antd";
import DetailsCard from "./DetailsCard";
import SecurityCard from "./SecurityCard";

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
    const { user } = this.state;

    return (
      <AppWrapper>
        {user ? (
          <div
            style={{
              marginTop: "2rem",
              marginLeft: "2rem",
              width: "calc(100% - 4rem)",
              height: "calc(100% - 4rem",
              borderRadius: "10px",
              border: "1px #EDEDED solid",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <DetailsCard currentUser={user} />
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

export default withRouter(UserEdit);
