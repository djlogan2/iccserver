import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";

import AppWrapper from "../AppWrapper";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";
import Loading from "../Loading";

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

        this.setState({ user: results[0] });
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
              border: "1px #EDEDED solid"
            }}
          >
            {JSON.stringify(user)}
          </div>
        ) : (
          <Loading />
        )}
      </AppWrapper>
    );
  }
}

export default withRouter(UserEdit);
