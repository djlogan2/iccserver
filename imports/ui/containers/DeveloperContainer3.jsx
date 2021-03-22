import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Row, Col, Table, Input, Button, Dropdown, Menu } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import { isReadySubscriptions } from "../../utils/utils";
import { Mongo } from "meteor/mongo";

const analysis_instances = new Mongo.Collection("aws_stockfish_instances");
const analysis_engines = new Mongo.Collection("aws_stockfish_engines");
const DOWN_STATUSES = ["interrupted", "termination_delay", "terminating", "stopping", "terminated"];

const instancecolumns = [
  { title: "_id", dataIndex: "id", key: 1 },
  { title: "AWS Instance ID", dataIndex: "instance_id", key: 2 },
  { title: "Spot Request ID", dataIndex: "spot_instance_id", key: 3 },
  { title: "IP Address", dataIndex: "ip_address", key: 4 },
  { title: "Status", dataIndex: "status", key: 5 },
  { title: "Action", dataIndex: "action", key: 6 }
];

const enginecolumns = [
  { title: "ID", dataIndex: "id", key: 1 },
  { title: "Engine ID", dataIndex: "engine_id", key: 2 },
  { title: "Engine Type", dataIndex: "name", key: 3 },
  { title: "Allocation ID", dataIndex: "ourid", key: 4 },
  { title: "Status", dataIndex: "status", key: 5 },
  { title: "Last", dataIndex: "when", key: 6 }
];

const menu = (
  <Menu>
    <Menu.Item key="1">New Game</Menu.Item>
    <Menu.Item key="2">Analyze Forever</Menu.Item>
    <Menu.Item key="3">Timed Analysis</Menu.Item>
    <Menu.Item key="4">Analyze Game</Menu.Item>
    <Menu.Item key="5">Free</Menu.Item>
  </Menu>
);

class DeveloperContainer3 extends Component {
  changeInstanceCount(data) {
    if (!data.target.value.length) {
      this.setState({ instance_count: "" });
    } else {
      this.setState({ instance_count: data.target.value });
    }
  }

  terminateInstance(id) {
    Meteor.call("developer_removeInstance", id);
  }

  saveInstanceCount() {
    if (!this.state?.instance_count) return;
    const count = analysis_instances.find({ status: { $nin: DOWN_STATUSES } }).count();
    const newcount = parseInt(this.state.instance_count);
    if (count === newcount) return;
    Meteor.call("developer_modifySpotFleetRequest", newcount);
  }

  handleEngineAction() {}

  allocateEngine() {
    this.setState({ allocating: true });
    Meteor.call("developer_allocateengine", (err, result) => {
      if (!!err) {
        console.log("err=" + err.message);
        this.setState({ allocating: false });
      } else this.setState({ allocated_engine: result, allocating: false });
      console.log("result=" + JSON.stringify(result));
    });
  }

  enginetable(record) {
    const tabledata = analysis_engines
      .find({ instance_id: record.instance_id })
      .fetch()
      .map(rec => {
        return {
          id: rec._id,
          engine_id: rec.engine_id,
          name: rec.engine_type.name,
          ourid: rec.our_id,
          status: rec.status,
          when: rec.when.toString(),
          action: rec.status !== "waiting" && (
            <Button onClick={() => this.freeEngine(rec._id)}>Free</Button>
          )
        };
      });
    return <Table dataSource={tabledata} columns={enginecolumns} pagination={{ pageSize: 100 }} />;
  }

  renderOurEngine() {
    if (!!this.state?.allocated_engine) {
      return (
        <div>
          <Row>
            <Col span={2}>dropdown</Col>
            <Col span={22}>thestuff</Col>
          </Row>
          <Row>
            <Col>submit button</Col>
          </Row>
        </div>
      );
    } else if (this.state?.allocating) return <Tag color="processing">Allocating engine</Tag>;
    else return <Button onClick={() => this.allocateEngine()}>Allocate</Button>;
  }

  render() {
    const tabledata = this.props.analysis_instances.map(ae => {
      return {
        id: ae._id,
        instance_id: ae.instance_id,
        spot_instance_id: ae.spot_fleet_instance.SpotInstanceRequestId,
        ip_address: ae.aws_instance?.PublicIpAddress,
        status: ae.status,
        action: DOWN_STATUSES.indexOf(ae.status) === -1 && (
          <Button onClick={() => this.terminateInstance(ae._id)}>Terminate</Button>
        )
      };
    });

    const count = tabledata.reduce((ct, td) => {
      return ct + (DOWN_STATUSES.indexOf(td.status) === -1 ? 1 : 0);
    }, 0);
    return (
      <div>
        <Row>
          <Col>
            <table>
              <tr>
                <td>Instance count:</td>
                <td>
                  <Input
                    onChange={data => this.changeInstanceCount(data)}
                    value={
                      !!this.state && "instance_count" in this.state
                        ? this.state.instance_count
                        : count
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Button onClick={() => this.saveInstanceCount()}>Save</Button>
                </td>
              </tr>
              <tr>
                <td>{this.renderOurEngine()}</td>
              </tr>
            </table>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              dataSource={tabledata}
              columns={instancecolumns}
              pagination={{ pageSize: 100 }}
              expandable={{
                expandedRowRender: record => this.enginetable(record),
                rowExpandable: record => DOWN_STATUSES.indexOf(record.status) === -1
              }}
            />
          </Col>
        </Row>
      </div>
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
    analysis_engines: Meteor.subscribe("developer_analysis_engines")
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    analysis_instances: analysis_instances.find().fetch(),
    analysis_engines: analysis_engines.find().fetch()
  };
})(DeveloperContainer3);
