import React from "react";
import { compose } from "redux";
import { Spin, Space, Col } from "antd";
import injectSheet from "react-jss";

import { Routes } from "../imports/startup/client/routes.jsx";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { defaultAppStyles } from "./defaultAppStyles";

class App extends React.Component {
  render() {
    const { isReady, classes } = this.props;

    return isReady ? (
      <Routes />
    ) : (
      <Col span={24} className={classes.loadingSidebar}>
        <Space size="middle">
          <Spin size="large" />
        </Space>
      </Col>
    );
  }
}

export default compose(
  withTracker(() => {
    const subscriptions = {
      css: Meteor.subscribe("css")
    };

    function isReady() {
      for (const k in subscriptions) if (!subscriptions[k].ready()) return false;
      return true;
    }

    return {
      isReady: isReady()
    };
  }),
  injectSheet(defaultAppStyles)
)(App);
