import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Row, Col, Table, Input, Button } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import { isReadySubscriptions } from "../../utils/utils";
import { Mongo } from "meteor/mongo";

const analysis_engines = new Mongo.Collection("aws_stockfish_instances");
const DOWN_STATUSES = ["interrupted", "termination_delay", "terminating", "stopping", "terminated"];
const columns = [
  { title: "_id", dataIndex: "id", key: "id" },
  { title: "AWS Instance ID", dataIndex: "instance_id", key: "id" },
  { title: "Spot Request ID", dataIndex: "spot_instance_id", key: "id" },
  { title: "IP Address", dataIndex: "ip_address", key: "id" },
  { title: "Status", dataIndex: "status", key: "id" },
  { title: "Action", dataIndex: "action", key: "id" }
];

class DeveloperContainer3 extends Component {
  changeInstanceCount(data) {
    if (!data.target.value.length) {
      this.setState({ instance_count: "" });
    } else {
      this.setState({ instance_count: data.target.value });
    }
  }

  saveInstanceCount() {
    if (!this.state?.instance_count) return;
    const count = analysis_engines.find({ status: { $nin: DOWN_STATUSES } }).count();
    const newcount = parseInt(this.state.instance_count);
    if (count === newcount) return;
    Meteor.call("developer_modifySpotFleetRequest", newcount);
  }

  render() {
    const tabledata = this.props.analysis_engines.map(ae => {
      return {
        id: ae._id,
        instance_id: ae.instance_id,
        spot_instance_id: ae.spot_fleet_instance.SpotInstanceRequestId,
        ip_address: ae.aws_instance?.PublicIpAddress,
        status: ae.status,
        action: <Button>Terminate</Button>
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
            </table>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table dataSource={tabledata} columns={columns} pagination={{ pageSize: 100 }} />
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
    analysis_engines: analysis_engines.find().fetch()
  };
})(DeveloperContainer3);
