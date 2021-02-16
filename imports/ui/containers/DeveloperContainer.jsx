import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Table } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import { isReadySubscriptions } from "../../utils/utils";
import date from "date-and-time";

const pingtable = new Mongo.Collection("pingtable");
const loggedon_users = new Mongo.Collection("loggedon_users");

const columns = [
  { title: "Connection ID", dataIndex: "connection_id", key: "key" },
  { title: "Last ping", dataIndex: "last", key: "key" },
  { title: "Minimum ping", dataIndex: "min_ping", key: "key" },
  { title: "Average ping", dataIndex: "avg_ping", key: "key" },
  { title: "Maximum ping", dataIndex: "max_ping", key: "key" },
  { title: "Ping count", dataIndex: "count_ping", key: "key" },
  { title: "Username", dataIndex: "username", key: "key" },
  { title: "IP Address", dataIndex: "ip_address", key: "key" },
  { title: "Online", dataIndex: "status", key: "key" },
  { title: "Game", dataIndex: "game_status", key: "key" },
  { title: "Client", dataIndex: "client_status", key: "key" }
];

class DeveloperContainer extends Component {
  load(tabledata, table, findfunction, updatefunction, usefunction) {
    table
      .find()
      .fetch()
      .forEach(table_rec => {
        if (!usefunction || usefunction(table_rec)) {
          let td = tabledata.find(td_rec => {
            return findfunction(table_rec, td_rec) ? td_rec : null;
          });
          if (!td) {
            td = { key: tabledata.length };
            tabledata.push(td);
          }
          updatefunction(table_rec, td);
        }
      });
  }

  do_pingtable(tabledata) {
    this.load(
      tabledata,
      pingtable,
      (table_rec, td_rec) => {
        return table_rec.connection_id === td_rec.connection_id;
      },
      (table_rec, td_rec) => {
        td_rec.last = date.format(table_rec.last, "YYYY-MM-DD HH:mm:ss");
        td_rec.min_ping = table_rec.pings.reduce((prev, cur) => {
          return prev === null || prev > cur ? cur : prev;
        }, null);
        td_rec.avg_ping = Math.round(
          table_rec.pings.reduce((a, b) => a + b) / table_rec.pings.length
        );
        td_rec.max_ping = table_rec.pings.reduce((prev, cur) => {
          return prev === null || prev < cur ? cur : prev;
        }, null);
        td_rec.count_ping = table_rec.pings.length;
        td_rec.connection_id = table_rec.connection_id;
      }
    );
  }

  do_loggedon_users(tabledata) {
    this.load(
      tabledata,
      loggedon_users,
      (table_rec, td_rec) => {
        return table_rec.connection_id === td_rec.connection_id;
      },
      (table_rec, td_rec) => {
        td_rec.connection_id = table_rec.connection_id;
        td_rec.user_id = table_rec.user_id;
        td_rec.ip_address = table_rec.ip_address;
      }
    );
  }

  do_all_users(tabledata) {
    Meteor.users
      .find()
      .fetch()
      .forEach(user => {
        let td_records = tabledata.filter(td => {
          return td.user_id === user._id ? td : null;
        });
        if (!td_records.length && user.status.online) {
          const td_rec = {};
          tabledata.push(td_rec);
          td_records.push(td_rec);
        }
        if (!!td_records) {
          td_records.forEach(td_rec => {
            td_rec.user_id = user._id;
            td_rec.username = user.username;
            td_rec.status = user.status.online.toString();
            td_rec.game_status = user.status.game;
            td_rec.client_status = user.status.client;
          });
        }
      });
  }

  render() {
    if (!this.props.isReady) return <div>Loading</div>;
    const tabledata = [];
    this.do_pingtable(tabledata);
    this.do_loggedon_users(tabledata);
    this.do_all_users(tabledata);
    return (
      <div>
        <Table dataSource={tabledata} columns={columns} />
      </div>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    developer_pingtable: Meteor.subscribe("developer_pingtable"),
    developer_loggedon_users: Meteor.subscribe("developer_loggedon_users"),
    deveoper_all_users: Meteor.subscribe("developer_all_users")
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    pingt: pingtable.find().fetch(),
    loggedonu: loggedon_users.find().fetch()
  };
})(DeveloperContainer);
