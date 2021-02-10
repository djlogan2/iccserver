import React, { Component } from "react";
import { Table } from "antd";
import { withRouter } from "react-router-dom";

import AppWrapper from "../AppWrapper";
import {
  renderRating,
  renderStatus,
  renderOnline,
  renderButtonEdit,
  renderEmail
} from "./renderListUtils";

const { Column, ColumnGroup } = Table;

class UsersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersList: [],
      usersCount: 0
    };
  }

  componentDidMount() {
    this.updateUsersList(0, 2000000);
  }

  updateUsersList = (offset, count, searchString) => {
    Meteor.call("listUsers", "users_list", offset, count, searchString, (err, data) => {
      if (!err) {
        this.setState({ usersList: data.userList, usersCount: data.totalCount });
      }
    });
  };

  render() {
    const { history } = this.props;
    const { usersList } = this.state;

    return (
      <AppWrapper>
        <div
          style={{
            marginTop: "2rem",
            marginLeft: "2rem",
            width: "calc(100% - 4rem)",
            height: "calc(100% - 4rem)",
            borderRadius: "10px",
            border: "1px #EDEDED solid"
          }}
        >
          <Table dataSource={usersList} style={{ width: "100%", height: "100%" }}>
            <ColumnGroup title="User info">
              <Column title="Username" dataIndex="username" key="username" />
              <Column title="E-mail" render={renderEmail} key="email" />
              <Column title="Locale" dataIndex="locale" key="locale" />
            </ColumnGroup>
            <ColumnGroup title="Ratings">
              <Column title="Blitz" key="blitz" render={renderRating("blitz")} />
              <Column title="Bullet" key="bullet" render={renderRating("bullet")} />
              <Column title="Standard" key="standard" render={renderRating("standard")} />
            </ColumnGroup>
            <ColumnGroup title="Statuses">
              <Column title="Online" render={renderOnline} />
              <Column title="Game" render={renderStatus("game")} />
            </ColumnGroup>
            <ColumnGroup title="Actions">
              <Column key="edit" render={renderButtonEdit(history)} />
            </ColumnGroup>
          </Table>
        </div>
      </AppWrapper>
    );
  }
}

export default withRouter(UsersList);
