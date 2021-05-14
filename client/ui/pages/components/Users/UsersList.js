import React, { Component } from "react";
import { Table } from "antd";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import AppWrapper from "../AppWrapper/AppWrapper";
import {
  renderRating,
  renderStatus,
  renderOnline,
  renderButtonEdit,
  renderEmail,
} from "./renderListUtils";
import { translate } from "../../../HOCs/translate";
import injectSheet from "react-jss";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { dynamicUserManagementStyles } from "./dynamicUserManagementStyles";
import { ROLE_LIST_USERS } from "../../../../constants/systemConstants";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";

const { Column, ColumnGroup } = Table;

class UsersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersList: [],
      usersCount: 0,
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

  handleRowClick = (row) => {
    const { history } = this.props;
    history.push(`${RESOURCE_USERS}/${row.username}`);
  };

  render() {
    const { history, translate, classes, roles } = this.props;
    const { usersList } = this.state;

    const scope = roles.find((element) => {
      if (element?.role?.id === ROLE_LIST_USERS) {
        return !!element.scope ? element.scope : null;
      }

      return false;
    });

    return (
      <AppWrapper>
        <div className={classes.listMainDiv}>
          <Table
            dataSource={usersList}
            className={classes.listTable}
            onRow={(row) => ({
              onClick: () => {
                this.handleRowClick(row);
              },
            })}
          >
            <ColumnGroup title={translate("userInfo")}>
              <Column title={translate("userInfo")} dataIndex="username" key="username" />
              <Column title={translate("email")} render={renderEmail} key="email" />
              <Column title={translate("locale")} dataIndex="locale" key="locale" />
              {!scope && (
                <Column
                  title={translate("isolationGroup")}
                  dataIndex="isolation_group"
                  key="isolation_group"
                />
              )}
            </ColumnGroup>
            <ColumnGroup title={translate("ratings")}>
              <Column title={translate("blitz")} key="blitz" render={renderRating("blitz")} />
              <Column title={translate("bullet")} key="bullet" render={renderRating("bullet")} />
              <Column
                title={translate("standard")}
                key="standard"
                render={renderRating("standard")}
              />
            </ColumnGroup>
            <ColumnGroup title={translate("statuses")}>
              <Column title={translate("online")} render={renderOnline} />
              <Column title={translate("game")} render={renderStatus("game")} />
            </ColumnGroup>
            <ColumnGroup title={translate("actions")}>
              <Column key="edit" render={renderButtonEdit(history, translate)} />
            </ColumnGroup>
          </Table>
        </div>
      </AppWrapper>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
      roles: Meteor.roleAssignment.find().fetch(),
    };
  }),
  withRouter,
  translate("Users.list"),
  injectSheet(dynamicUserManagementStyles)
)(UsersList);
