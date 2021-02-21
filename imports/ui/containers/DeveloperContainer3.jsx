import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Row, Col } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import { serverTS, clientTS } from "../../../lib/client/timestamp";

class DeveloperContainer3 extends Component {
  constructor(props) {
    super(props);
    const sysdate = new Date().getTime();
    this.state = {
      sysdate: sysdate,
      tsdate: sysdate,
      server_pings: 0,
      last_ping_sent: {},
      last_response_received: {}
    };
    this.server_pings = [];
  }

  interval() {
    const sysdate = new Date().getTime();
    const tsdate = serverTS().getMilliseconds();
    this.setState({ sysdate: sysdate, tsdate: tsdate });
  }

  sendingPing(request) {
    this.server_pings.push(request);
    const sysdate = new Date().getTime();
    const tsdate = serverTS().getMilliseconds();
    this.setState({ sysdate: sysdate, tsdate: tsdate, server_pings: this.server_pings.length, last_ping_sent: request });
  }

  stop() {
    console.log("stop");
  }

  cleanupOldPings(request) {
    this.server_pings = this.server_pings.filter(p => p.id !== request.id);
    const sysdate = new Date().getTime();
    const tsdate = serverTS().getMilliseconds();
    this.setState({ sysdate: sysdate, tsdate: tsdate, server_pings: this.server_pings.length });
  }

  pingArrived(response) {
    this.server_pings = this.server_pings.filter(p => p.id !== response.id);
    const arrival = serverTS().getMilliseconds();
    const delay = arrival - response.originate - (response.transmit - response.receive);
    const sysdate = new Date().getTime();
    const tsdate = serverTS().getMilliseconds();
    if(delay < 0) {
      this.setState({ sysdate: sysdate, tsdate: tsdate, server_pings: this.server_pings.length, last_response_received: response, delay: delay, arrival: arrival,
      last_bad_ping_sent: this.state.last_ping_sent,
      last_bad_response_received: response,
      last_bad_delay: delay,
      last_bad_arrival: arrival
      });
    } else
      this.setState({ sysdate: sysdate, tsdate: tsdate, server_pings: this.server_pings.length, last_response_received: response, delay: delay, arrival: arrival });
  }

  sendingPingResult(result) {
    console.log("sendingPingResult");
  }

  serverLagFunc() {
    console.log("serverLagFunc");
  }

  sendingPong(pong) {
    console.log("sendingPong");
  }

  clientLagFunc() {
    console.log("clientLagFunc");
  }

  componentDidMount() {
    this.fuckme = {
      sendingPing: request => this.sendingPing(request),
      stop: () => this.stop(),
      cleanupOldPings: request => this.cleanupOldPings(request),
      pingArrived: response => this.pingArrived(response),
      sendingPingResult: result => this.sendingPingResult(result),
      serverLagFunc: () => this.serverLagFunc(),
      sendingPong: pong => this.sendingPong(pong),
      clientLagFunc: () => this.clientLagFunc()
    };
    serverTS().events.on("sendingPing", this.fuckme.sendingPing);
    serverTS().events.on("stop", this.fuckme.stop);
    serverTS().events.on("cleanupOldPings", this.fuckme.cleanupOldPings);
    serverTS().events.on("pingArrived", this.fuckme.pingArrived);
    serverTS().events.on("sendingPingResult", this.fuckme.sendingPingResult);
    serverTS().events.on("lagFunc", this.fuckme.serverLagFunc);

    clientTS().events.on("sendingPong", this.fuckme.sendingPong);
    clientTS().events.on("lagFunc", this.fuckme.clientLagFunc);

    //this.interval_id = Meteor.setInterval(() => this.interval(), 1000);
  }

  componentWillUnmount() {
    //Meteor.clearInterval(this.interval_id);
    serverTS().events.removeListener("sendingPing", this.fuckme.sendingPing);
    serverTS().events.removeListener("stop", this.fuckme.stop);
    serverTS().events.removeListener("cleanupOldPings", this.fuckme.cleanupOldPings);
    serverTS().events.removeListener("pingArrived", this.fuckme.pingArrived);
    serverTS().events.removeListener("sendingPingResult", this.fuckme.sendingPingResult);
    serverTS().events.removeListener("lagFunc", this.fuckme.serverLagFunc);

    clientTS().events.removeListener("sendingPong", this.fuckme.sendingPong);
    clientTS().events.removeListener("lagFunc", this.fuckme.clientLagFunc);
  }

  render() {
    const left = 2;
    const right = 22;
    const diff = this.state.sysdate - this.state.tsdate;
    const server = this.server_pings.map(ping => (
      <Row>
        <Col span={2}>{ping.id}</Col>
        <Col span={2}>{ping.originate}</Col>
        <Col span={20}/>
      </Row>
    ));
    return (
      <div>
        <Row>
          <Col span={left}>Connection ID</Col>
          <Col span={right}>{this.props.connection_id}</Col>
        </Row>
        <Row>
          <Col span={left}>System Date</Col>
          <Col span={right}>{this.state.sysdate}</Col>
        </Row>
        <Row>
          <Col span={left}>Timestamp Date</Col>
          <Col span={right}>{this.state.tsdate}</Col>
        </Row>
        <Row>
          <Col span={left}>Difference</Col>
          <Col span={right}>{diff}</Col>
        </Row>
        <Row>
          <Col span={left}>Last ping sent</Col>
          <Col span={right}>
            <Row>
              <Col span={left}>ID:</Col>
              <Col span={right}>{this?.state?.last_ping_sent?.id}</Col>
            </Row>
            <Row>
              <Col span={left}>Originate:</Col>
              <Col span={right}>{this?.state?.last_ping_sent?.originate}</Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={left}>Last result received</Col>
          <Col span={right}>
            <Row>
              <Col span={left}>ID:</Col>
              <Col span={right}>{this?.state?.last_response_received?.id}</Col>
            </Row>
            <Row>
              <Col span={left}>Originate:</Col>
              <Col span={right}>{this?.state?.last_response_received?.originate}</Col>
            </Row>
            <Row>
              <Col span={left}>Transmit:</Col>
              <Col span={right}>{this?.state?.last_response_received?.transmit}</Col>
            </Row>
            <Row>
              <Col span={left}>Receive:</Col>
              <Col span={right}>{this?.state?.last_response_received?.receive}</Col>
            </Row>
            <Row>
              <Col span={left}>Arrival:</Col>
              <Col span={right}>{this?.state?.arrival}</Col>
            </Row>
            <Row>
              <Col span={left}>Calculated delay:</Col>
              <Col span={right}>{this?.state?.delay}</Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={left}>Last BAD result received</Col>
          <Col span={right}>
            <Row>
              <Col span={left}>ID:</Col>
              <Col span={right}>{this?.state?.last_bad_response_received?.id}</Col>
            </Row>
            <Row>
              <Col span={left}>Originate:</Col>
              <Col span={right}>{this?.state?.last_bad_response_received?.originate}</Col>
            </Row>
            <Row>
              <Col span={left}>Transmit:</Col>
              <Col span={right}>{this?.state?.last_bad_response_received?.transmit}</Col>
            </Row>
            <Row>
              <Col span={left}>Receive:</Col>
              <Col span={right}>{this?.state?.last_bad_response_received?.receive}</Col>
            </Row>
            <Row>
              <Col span={left}>Arrival:</Col>
              <Col span={right}>{this?.state?.last_bad_arrival}</Col>
            </Row>
            <Row>
              <Col span={left}>Calculated delay:</Col>
              <Col span={right}>{this?.state?.last_bad_delay}</Col>
            </Row>
          </Col>
        </Row>
        {server}
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
  return {
    connection_id: Meteor.default_connection._lastSessionId
  };
})(DeveloperContainer3);
