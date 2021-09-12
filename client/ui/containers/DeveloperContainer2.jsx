import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import React, { Component } from "react";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import MinusOutlined from "@ant-design/icons/MinusOutlined";
import {
  Alert,
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
  Typography,
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
    const users = this.props.everyone.map((user) => (
      <Menu.Item key={user?._id}>{user?.username}</Menu.Item>
    ));
    return (
      <Sider width={200}>
        <Menu
          mode="inline"
          style={{ height: "100%", borderRight: 0 }}
          onClick={(item) => {
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
  constructor(props) {
    super(props);
    this.state = {};
  }

  toggleVerified(email) {
    Meteor.call("developer_email_update", this.props.user_id, "toggle", this.state.email, (err) => {
      if (!!err) this.props.onError(err);
    });
  }

  removeEmail(email) {
    Meteor.call("developer_email_update", this.props.user_id, "remove", email, (err) => {
      if (!!err) this.props.onError(err);
    });
  }

  newEmail(item) {
    this.setState({ email: item.target.value });
  }

  toggleNewEmailVerified() {
    this.setState({ verified: !this.state.verified });
  }

  saveNewEmail() {
    Meteor.call(
      "developer_email_update",
      this.props.user_id,
      "add",
      this.state.email,
      this.state.verified,
      (err) => {
        if (!!err) this.props.onError(err);
        else {
          this.setState({ email: undefined, verified: undefined });
        }
      }
    );
  }

  render() {
    const GUTTER = 16;
    const C1 = 22;
    const C2 = 1;
    const C3 = 1;
    if (!this.props.emails) return <div />;
    const rows = this.props.emails.map((email) => (
      <Row gutter={GUTTER}>
        <Col span={C1}>{email.address}</Col>
        <Col span={C2}>
          <Checkbox checked={email.verified} onClick={() => this.toggleVerified(email.address)} />
        </Col>
        <Col span={C3}>
          <Button
            shape="circle"
            type="danger"
            onClick={() => this.removeEmail(email.address)}
            icon={<MinusOutlined />}
          />
        </Col>
      </Row>
    ));
    return (
      <div>
        <Row gutter={GUTTER}>
          <Col span={C1}>Email Address</Col>
          <Col span={C2}>Verified</Col>
          <Col span={C3}>{""}</Col>
        </Row>
        {rows}
        <Row gutter={GUTTER}>
          <Col span={C1}>
            <Input value={this.state.email} onChange={(arg) => this.newEmail(arg)} />
          </Col>
          <Col span={C2}>
            <Checkbox checked={this.state.verified} onClick={() => this.toggleNewEmailVerified()} />
          </Col>
          <Col span={C3}>
            <Button
              shape="circle"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => this.saveNewEmail()}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const style = {
  No: {},
  Global: { "background-color": "red" },
  "Group only": { "background-color": "yellow" },
};

class Roles extends Component {
  changeRole(victim, role, changeto) {
    Meteor.call("developer_update_role", victim, role, changeto, (err) => {
      this.props.onError(err);
    });
  }

  render() {
    // Role   Status             Set others
    // role   [no/global/iso]    [no/global/iso]
    const all_roles = Meteor.roles.find().fetch();
    all_roles.sort((a, b) => a._id.localeCompare(b._id));
    const roles = all_roles
      .filter((role) => {
        return !role._id.startsWith("set_role_");
      })
      .map((role_object) => {
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
              <Select
                style={style[in_role.toLowerCase()]}
                value={in_role}
                onChange={(arg) => this.changeRole(this.props.user_id, role, arg)}
              >
                <Option value="No">No</Option>
                <Option value="Global">Global</Option>
                <Option value="Group only">Group Only</Option>
              </Select>
            </td>
            <td>
              <Select
                className={style[set_role.toLowerCase()]}
                value={set_role}
                onChange={(arg) => this.changeRole(this.props.user_id, "set_role_" + role, arg)}
              >
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
      <table>
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
      { title: "User Agemt", dataIndex: "userAgent", key: "_id" },
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
    const userhistory = history.map((hist) => {
      return {
        logon_date: date.format(hist.logon_date, "YYYY-MM-DD HH:mm:ss"),
        logoff_date: !hist.logoff_date ? "" : date.format(hist.logoff_date, "YYYY-MM-DD HH:mm:ss"),
        ip_address: hist.ip_address,
        userAgent: hist.userAgent,
      };
    });
    return <Table dataSource={userhistory} columns={columns} />;
  }
}

class DeveloperContainer2 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  dohim(item) {
    this.setState({ user: item.key, base: null, save: true });
  }

  setError(err) {
    this.setState({ error: err });
  }

  changeSetting(user, key, value) {
    if (!this || !this.state) return;
    const base = { ...this.state.base };
    const settings = base.settings || {};

    const user_setting =
      user.settings === undefined || user.settings[key] === undefined
        ? "---false---"
        : user.settings[key];
    const new_setting = value === undefined || value === false ? "---false---" : value;

    if (settings[key] === new_setting) return;
    if (user_setting === new_setting) delete settings[key];
    else settings[key] = value;

    if (!!Object.keys(settings).length) base.settings = settings;
    else delete base.settings;
    this.setState({ base: base });
  }

  dochange(item) {
    if (!this || !this.state) return;
    const base = { ...this.state.base };
    const user = Meteor.users.findOne({ _id: this.state.user });
    switch (item.target.id) {
      case "premove":
        this.changeSetting(user, item.target.id, item.target.checked);
        break;
      case "username":
      case "isolation_group":
      case "locale":
        if (!!user && user[item.target.id] === item.target.value) delete base[item.target.id];
        else base[item.target.id] = item.target.value;
        this.setState({ base: base });
        break;
      case "password":
        if (!item.target.value || item.target.value === "") delete base.password;
        else base.password = item.target.value;
        this.setState({ base: base });
        break;
      default:
        debugger;
    }
  }

  childchat(value) {
    if (!this || !this.state) return;
    const base = { ...this.state.base };
    const user = Meteor.users.findOne({ _id: this.state.user });
    if (!!user && (user.cf === value || (value === "d" && !user.cf))) delete base.cf;
    else base.cf = value;
    this.setState({ base: base });
  }

  dosave() {
    Meteor.call("developer_user_update", this.state, (err) => {
      const state = { base: undefined };
      if (!!err) state.error = err;
      this.setState(state);
    });
  }

  static getDerivedStateFromProps(pros, state) {
    state.save = DeveloperContainer2.save_disabled(state);
    console.log("state.save=" + state.save);
    return state;
  }

  static save_disabled(state) {
    if (!state.user) return true;
    console.log("state.user=" + JSON.stringify(state.user));
    if (!!state.base) {
      console.log("state.base=" + JSON.stringify(state.base));
      if (
        state.base.username === "" ||
        state.base.isolation_group === "" ||
        state.base.locale === "" ||
        state.settings?.premove !== undefined
      )
        return true;
      if (!!Object.keys(state.base).length) return false;
    }
    return true;
  }

  render() {
    const left = 3;
    const right = 21;
    const user = Meteor.users.findOne({ _id: this.state.user });
    const base = this.state.base;
    let error_div = "";
    if (this.state.error)
      error_div = (
        <Alert
          message={this.state.error.message}
          type="error"
          closable
          description={this.state.error.reason}
        />
      );
    return (
      <Layout>
        <UserList
          onClick={(item) => this.dohim(item)}
          isReady={this.props.isReady}
          everyone={this.props.everyone}
        />
        <Layout>
          <Content>
            {error_div}
            <Collapse accordian>
              <Panel header="Base" key="1">
                <Row>
                  <Col span={left}>User ID</Col>
                  <Col span={right}>
                    <Title level={4}>{user?._id}</Title>
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Username</Col>
                  <Col span={right}>
                    <Input
                      id="username"
                      value={base?.username === undefined ? user?.username : base?.username}
                      onChange={(arg) => this.dochange(arg)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Isolation Group</Col>
                  <Col span={right}>
                    <Input
                      id="isolation_group"
                      value={
                        base?.isolation_group === undefined
                          ? user?.isolation_group
                          : base?.isolation_group
                      }
                      onChange={(arg) => this.dochange(arg)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Password</Col>
                  <Col span={right}>
                    <Password
                      id="password"
                      value={base?.password}
                      onChange={(arg) => this.dochange(arg)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Child Chat</Col>
                  <Col span={right}>
                    <Select
                      value={base?.cf || user?.cf || "d"}
                      onChange={(arg) => this.childchat(arg)}
                    >
                      <Option value="d">Default</Option>
                      <Option value="c">Child</Option>
                      <Option value="e">Exempt</Option>
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Locale</Col>
                  <Col span={right}>
                    <Input
                      id="locale"
                      value={base?.locale || user?.locale}
                      onChange={(arg) => this.dochange(arg)}
                    />
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
                <Row>
                  <Col>
                    <Button type="primary" onClick={() => this.dosave()} disabled={this.state.save}>
                      Save
                    </Button>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Status" key="2">
                <Row>
                  <Col span={left}>Last Login Date</Col>
                  <Col span={right}>
                    <Input
                      value={
                        !!user?.status?.lastLogin?.date
                          ? date.format(user?.status?.lastLogin?.date, "YYYY-MM-DD HH:mm:ss")
                          : ""
                      }
                    />
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
                  <Col span={left}>Logged onto V1</Col>
                  <Col span={right}>
                    <Checkbox checked={user?.legacy} />
                  </Col>
                </Row>
                <Row>
                  <Col span={left}>Last Activity</Col>
                  <Col span={right}>
                    <Input
                      value={
                        user?.status?.lastActivity
                          ? date.format(user?.status?.lastActivity, "YYYY-MM-DD HH:mm:ss")
                          : ""
                      }
                    />
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
                <EmailList
                  user_id={user?._id}
                  emails={user?.emails}
                  onError={(err) => this.setError(err)}
                />
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
              <Panel header="Settings" key="5">
                <Row>
                  <Col span={left}>Premove</Col>
                  <Col span={right}>
                    <Checkbox
                      id="premove"
                      checked={
                        base?.settings?.premove === undefined
                          ? user?.settings?.premove
                          : base.settings.premove
                      }
                      onChange={(arg) => this.dochange(arg)}
                    />{" "}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button type="primary" onClick={() => this.dosave()} disabled={this.state.save}>
                      Save
                    </Button>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Roles" key="6">
                <Roles
                  user_id={user?._id}
                  isolation_group={user?.isolation_group}
                  onError={(err) => this.setError(err)}
                />
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
    deveoper_all_users: Meteor.subscribe("developer_all_users"),
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    everyone: Meteor.users.find({}, { sort: { username: 1 } }).fetch(),
    everyones_roles: Meteor.roleAssignment.find().fetch(),
    everyones_logon_history: LogonHistory.find().fetch(),
  };
})(DeveloperContainer2);
