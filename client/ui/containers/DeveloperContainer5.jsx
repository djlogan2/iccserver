import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../lib/client/Logger";
import { GameRequestCollection } from "../../../imports/api/client/collections";
import { Table } from "antd";

const logger = new Logger("client/developer5_js");

const seekcolumns = [
  { title: "Create Date", dataIndex: "createDate", key: "key" },
  { title: "Rating Type", dataIndex: "rating_type", key: "key" },
  { title: "Minutes", dataIndex: "time", key: "key" },
  { title: "Inc/Delay", dataIndex: "inc_or_delay", key: "key" },
  { title: "Delay Type", dataIndex: "delaytype", key: "key" },
  { title: "Rated", dataIndex: "rated", key: "key" },
  { title: "Color", dataIndex: "color", key: "key" },
  { title: "Min Rating", dataIndex: "minrating", key: "key" },
  { title: "Max Rating", dataIndex: "maxrating", key: "key" },
];

const matchcolumns = [
  { title: "Challenger", dataIndex: "opponent", key: "key" },
  { title: "Rating", dataIndex: "opponent_rating", key: "key" },
  { title: "Rating Type", dataIndex: "rating_type", key: "key" },
  { title: "Minutes", dataIndex: "challenger_time", key: "key" },
  { title: "Inc/Delay", dataIndex: "challenger_inc_or_delay", key: "key" },
  { title: "Delay Type", dataIndex: "challenger_delaytype", key: "key" },
  { title: "Rated", dataIndex: "rated", key: "key" },
  { title: "Color", dataIndex: "challenger_color_request", key: "key" },
  { title: "Win", dataIndex: "assess_win", key: "key" },
  { title: "Draw", dataIndex: "assess_draw", key: "key" },
  { title: "Loss", dataIndex: "assess_loss", key: "key" },
];
class DeveloperContainer5 extends Component {
  render() {
    const matchin = [];
    const matchout = [];
    const seekin = [];
    const seekout = [];
    this.props.requests.forEach((request) => {
      if (request.type === "seek") {
        if (request.owner === Meteor.userId()) {
          // Our seek
          seekout.push(request);
        } else {
          // Somebody elses seek
          seekin.push(request);
        }
      } else {
        if (request.challenger_id === Meteor.userId()) {
          // It is our match
          request.opponent = request.receiver;
          request.opponent_rating = request.receiver_rating;
          matchout.push(request);
        } else {
          // Somebody is matching us
          request.opponent = request.challenger;
          request.opponent_rating = request.challenger_rating;
          matchin.push(request);
        }
      }
    });
    return (
      <div>
        <div>
          <Table dataSource={matchin} columns={matchcolumns} pagination={{ pageSize: 100 }} />
          <Table dataSource={seekin} columns={seekcolumns} pagination={{ pageSize: 100 }} />
          <Table dataSource={matchout} columns={matchcolumns} pagination={{ pageSize: 100 }} />
          <Table dataSource={seekout} columns={seekcolumns} pagination={{ pageSize: 100 }} />
        </div>
      </div>
    );
  }
}

export default withTracker(() => {
  return {
    isReady: true,
    requests: GameRequestCollection.find().fetch(),
  };
})(DeveloperContainer5);
