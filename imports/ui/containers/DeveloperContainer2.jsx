import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import React, { Component } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Input,
  Layout,
  Menu,
  Row,
  Select,
  Table,
  Typography
} from "antd";
import date from "date-and-time";
import { withTracker } from "meteor/react-meteor-data";
import { isReadySubscriptions } from "../../utils/utils";
import Password from "antd/lib/input/Password";
const { Content, Sider } = Layout;
const { Panel } = Collapse;
const { Option } = Select;
const { Title, Text } = Typography;

const LogonHistory = new Mongo.Collection("logon_history");

class UserList extends Component {
  render() {
    if (!this.props.isReady) return <div>Loading</div>;
    const users = this.props.everyone.map(user => (
      <Menu.Item key={user?._id}>{user?.username}</Menu.Item>
    ));
    return (
      <Sider width={200}>
        <Menu
          mode="inline"
          style={{ height: "100%", borderRight: 0 }}
          onClick={item => {
            this.props.onClick(item);
          }}
        >
          {users}
        </Menu>
      </Sider>
    );
  }
}

class EmailList extends Component {
  render() {
    if (!this.props.emails) return <div />;
    const rows = this.props.emails.map(email => (
      <tr>
        <td>
          <Button type="danger">Remove</Button>
        </td>
        <td>{email.address}</td>
        <td>
          <Checkbox checked={email.verified} />{" "}
        </td>
      </tr>
    ));
    return (
      <table width="100%">
        <tr>
          <th />
          <th>Email address</th>
          <th>Verified</th>
        </tr>
        {rows}
        <tr>
          <Button type="primary">Add</Button>
          <td>
            <Input />
          </td>
          <td>
            <Checkbox />
          </td>
          <td />
        </tr>
      </table>
    );
  }
}

class Roles extends Component {
  render() {
    // Role   Status             Set others
    // role   [no/global/iso]    [no/global/iso]
    const all_roles = Meteor.roles.find().fetch();
    all_roles.sort((a, b) => a._id.localeCompare(b._id));
    const roles = all_roles
      .filter(role => {
        return !role._id.startsWith("set_role_");
      })
      .map(role_object => {
        const role = role_object._id;
        const user_role = Meteor.roleAssignment
          .find({ $and: [{ "user._id": this.props.user_id }, { "role._id": role }] })
          .fetch();
        const user_set_role = Meteor.roleAssignment
          .find({ $and: [{ "user._id": this.props.user_id }, { "role._id": "set_role_" + role }] })
          .fetch();
        let in_role;
        let set_role;
        if (!user_role || !user_role.length) {
          in_role = "No";
        } else if (user_role.length === 1) {
          if (!user_role.scope) {
            in_role = "Global";
          } else {
            in_role = "Group only";
          }
        } else {
          in_role = "ERROR";
        }
        if (!user_set_role || !user_set_role.length) {
          set_role = "No";
        } else if (user_set_role.length === 1) {
          if (!user_set_role.scope) {
            set_role = "Global";
          } else {
            set_role = "Group only";
          }
        } else {
          set_role = "ERROR";
        }
        let error = "";
        if (!!user_role.scope && user_role.scope !== this.props.isolation_group)
          error = "SCOPE ERROR IN USE ROLE";
        if (!!user_set_role.scope && user_set_role.scope !== this.props.isolation_group) {
          if (error !== "") error += ", ";
          error += "SCOPE ERROR IN SET ROLE";
        }
        return (
          <tr>
            <td>{role}</td>
            <td>
              <Select value={in_role}>
                <Option value="No">No</Option>
                <Option value="Global">Global</Option>
                <Option value="Group only">Group Only</Option>
              </Select>
            </td>
            <td>
              <Select value={set_role}>
                <Option value="No">No</Option>
                <Option value="Global">Global</Option>
                <Option value="Group only">Group Only</Option>
              </Select>
            </td>
            <td>{error}</td>
          </tr>
        );
      });
    return (
      <table width="100%">
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Is In Role</th>
            <th>Set Others</th>
            <th />
          </tr>
        </thead>
        <tbody>{roles}</tbody>
      </table>
    );
  }
}

class History extends Component {
  render() {
    const columns = [
      { title: "Logon Date", dataIndex: "logon_date", key: "_id" },
      { title: "Logoff Date", dataIndex: "logoff_date", key: "_id" },
      { title: "IP Address", dataIndex: "ip_address", key: "_id" },
      { title: "User Agemt", dataIndex: "userAgent", key: "_id" }
    ];
    const history = LogonHistory.find({ user_id: this.props.user_id }).fetch();
    history.sort((a, b) => {
      const ldc = b.logon_date.getTime() - a.logon_date.getTime();
      if (!!ldc) return ldc;
      if (!a.logoff_date && !b.logoff_date) return 0;
      if (!a.logoff_date && !!b.logoff_date) return -1;
      if (!!a.logoff_date && !b.logoff_date) return 1;
      return b.logoff_date.getTime() - a.logoff_date.getTime();
    });
    const userhistory = history.map(hist => {
      return {
        logon_date: date.format(hist.logon_date, "YYYY-MM-DD HH:mm:ss"),
        logoff_date: !hist.logoff_date ? "" : date.format(hist.logoff_date, "YYYY-MM-DD HH:mm:ss"),
        ip_address: hist.ip_address,
        userAgent: hist.userAgent
      };
    });
    return <Table dataSource={userhistory} columns={columns} />;
  }
}

class DeveloperContainer2 extends Component {
  constructor(props) {
    super(props);
    this.state = { user: "x" };
  }
  dohim(item) {
    this.setState({ user: item.key });
  }
  render() {
    const left = 3;
    const right = 21;
    const user = Meteor.users.findOne({ _id: this.state.user });
    return (
      <Layout>
        <UserList
          onClick={item => this.dohim(item)}
          isReady={this.props.isReady}
          everyone={this.props.everyone}
        />
        <Layout>
          <Content>
            <Collapse accordian>
              <Panel header="Base" key="1">
                <Row>
                  <Col span={left}>Legacy</Col>
                  <Col span={right}>
                    <Title level={4}>{user?._id}</Title>
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Username</Col>
                  <Col span={right}>
                    <Input value={user?.username} onChange={() => {}} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Isolation Group</Col>
                  <Col span={right}>
                    <Input value={user?.isolation_group} onChange={() => {}} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Legacy</Col>
                  <Col span={right}>
                    <Checkbox checked={user?.legacy} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Password</Col>
                  <Col span={right}>
                    <Password onChange={() => {}} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Child Chat</Col>
                  <Col span={right}>
                    <Select value={user?.cf || "d"}>
                      <Option value="d">Default</Option>
                      <Option value="c">Child</Option>
                      <Option value="e">Exempt</Option>
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Locale</Col>
                  <Col span={right}>
                    <Input value={user?.locale} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Board CSS</Col>
                  <Col span={right}>
                    <Input value={user?.board_css} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Create Date</Col>
                  <Col span={right}>
                    <Text>{user?.createdAt?.toString()}</Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>New guy</Col>
                  <Col span={right}>
                    <Checkbox checked={user?.newguy} />
                  </Col>
                </Row>
              </Panel>
              <Panel header="Status" key="2">
                <Row>
                  <Col span={left}>Last Login Date</Col>
                  <Col span={right}>
                    <Input value={user?.status?.lastLogin?.date} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Last Login IP Address</Col>
                  <Col span={right}>
                    <Input value={user?.status?.lastLogin?.ipAddr} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Last Login User Agent</Col>
                  <Col span={right}>
                    <Input value={user?.status?.lastLogin?.userAgent} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Online</Col>
                  <Col span={right}>
                    <Checkbox checked={user?.status?.online} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Idle</Col>
                  <Col span={right}>
                    <Checkbox checked={user?.status?.idle} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Last Activity</Col>
                  <Col span={right}>
                    <Input value={user?.status?.lastActivity} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Client</Col>
                  <Col span={right}>
                    <Input value={user?.status?.client} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Game</Col>
                  <Col span={right}>
                    <Select value={user?.status?.game}>
                      <Option value="none">None</Option>
                      <Option value="playing">Playing</Option>
                      <Option value="examining">Examining</Option>
                      <Option value="observing">Observing</Option>
                    </Select>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Email Addresses" key="3">
                <EmailList emails={user?.emails} />
              </Panel>
              <Panel header="Profile" key="4">
                <Row>
                  <Col span={left}>First Name</Col>
                  <Col span={right}>
                    <Input value={user?.profile?.firstname} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Last Name</Col>
                  <Col span={right}>
                    <Input value={user?.profile?.lastname} />
                  </Col>
                </Row>
                <Card title="Legacy (V1) Login information">
                  <Row>
                    <Col span={left}>Username</Col>
                    <Col span={right}>
                      <Input value={user?.profile?.legacy?.username} />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={left}>Password</Col>
                    <Col span={right}>
                      <Password />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={left}>Validated</Col>
                    <Col span={right}>
                      <Checkbox checked={user?.profile?.legacy?.validated} />{" "}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={left}>Auto Login</Col>
                    <Col span={right}>
                      <Checkbox checked={user?.profile?.legacy?.autologin} />{" "}
                    </Col>
                  </Row>
                </Card>
              </Panel>
              <Panel header="Settings" key="5" />
              <Panel header="Roles" key="6">
                <Roles user_id={user?._id} isolation_group={user?.isolation_group} />
              </Panel>
              <Panel header="Login History" key="7">
                <History user_id={user?._id} />
              </Panel>
              <Panel header="Game History" key="8" />
            </Collapse>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

//  ------------------------------------------------------------
//  SETTINGS
//  ------------------------------------------------------------
//      autoaccept
//      seek default
//      match default
//  ------------------------------------------------------------
//  LOGIN HISTORY
//  ------------------------------------------------------------
//  ------------------------------------------------------------
//  GAME HISTORY
//  ------------------------------------------------------------
export default withTracker(() => {
  const subscriptions = {
    deveoper_all_users: Meteor.subscribe("developer_all_users")
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    everyone: Meteor.users.find({}, { sort: { username: 1 } }).fetch(),
    everyones_roles: Meteor.roleAssignment.find().fetch(),
    everyones_logon_history: LogonHistory.find().fetch()
  };
})(DeveloperContainer2);
