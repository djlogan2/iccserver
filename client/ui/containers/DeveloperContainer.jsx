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
  { title: "Username", dataIndex: "username", key: "key" },
  { title: "IP Address", dataIndex: "ip_address", key: "key" },
  { title: "Idle", dataIndex: "idle", key: "key" },

  { title: "Client", dataIndex: "client_status", key: "key" },
  { title: "Game", dataIndex: "game_status", key: "key" },

  { title: "Server Min/Avg/Max/Last", dataIndex: "s_ping", key: "key" },

  { title: "Client Min/Avg/Max/Last", dataIndex: "c_ping", key: "key" }
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
        const s_last60 = table_rec.server_pings.slice(
          Math.max(table_rec.server_pings.length - 60, 0)
        );
        td_rec.s_ping =
          "" +
          s_last60.reduce((prev, cur) => {
            return prev === null || prev > cur ? cur : prev;
          }, null);
        if (!!s_last60.length)
          td_rec.s_ping +=
            " / " + Math.round(s_last60.reduce((a, b) => a + b, 0) / s_last60.length);
        td_rec.s_ping +=
          " / " +
          s_last60.reduce((prev, cur) => {
            return prev === null || prev < cur ? cur : prev;
          }, null);
        td_rec.s_ping += " / " + s_last60.splice(-1);

        const c_last60 = table_rec.client_pings.slice(
          Math.max(table_rec.client_pings.length - 60, 0)
        );
        td_rec.c_ping =
          "" +
          c_last60.reduce((prev, cur) => {
            return prev === null || prev > cur ? cur : prev;
          }, null);
        if (!!c_last60.length)
          td_rec.c_ping +=
            " / " + Math.round(c_last60.reduce((a, b) => a + b, 0) / c_last60.length);
        td_rec.c_ping +=
          " / " +
          c_last60.reduce((prev, cur) => {
            return prev === null || prev < cur ? cur : prev;
          }, null);
        td_rec.c_ping += " / " + c_last60.splice(-1);


        td_rec.last = date.format(table_rec.last, "YYYY-MM-DD HH:mm:ss");
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

  xxx(ms) {
    if (!ms) return "";

    if (ms < 1000) return "<0s";
    let ims = ms;

    ims = ms / 1000; // # of seconds
    if (ims < 60) return "" + Math.floor(ims) + "s";

    ims /= 60; // # of minutes
    if (ims < 60) return "" + Math.floor(ims) + "m";

    ims /= 60; // # of hours
    if (ims < 24) return "" + Math.floor(ims) + "h";

    ims /= 24;
    return "" + Math.round(ims) + "d";
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
            if (user?.status?.lastActivity) {
              let dif = new Date().getTime() - user.status.lastActivity.getTime();
              td_rec.idle = this.xxx(dif);
            } else td_rec.idle = "";
            td_rec.user_id = user._id;
            td_rec.username = user.username;
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
        <Table dataSource={tabledata} columns={columns} pagination={{ pageSize: 100 }} />
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
