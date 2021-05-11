import React from "react";
import { compose } from "redux";
import { Spin, Space, Col } from "antd";
import injectSheet from "react-jss";
import i18n from "meteor/universe:i18n";
import "antd/dist/antd.css";

import { Routes } from "../imports/startup/client/routes.jsx";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { defaultAppStyles } from "./defaultAppStyles";
import { ClientInternationalizationCollection, mongoCss } from "../imports/api/client/collections";
import { getLang, isReadySubscriptions, updateLocale } from "../imports/utils/utils";

class App extends React.Component {
  render() {
    const { isReady, classes, i18nTranslate, currentRoles } = this.props;

    if (i18nTranslate) {
      i18n.addTranslations(updateLocale(i18nTranslate.locale), i18nTranslate.i18n);

      i18n.setOptions({
        defaultLocale: updateLocale(i18nTranslate.locale),
      });
    }

    const availableRoutes = currentRoles.map((role) => role?.role?._id);

    return isReady ? (
      <Routes currentRoles={availableRoutes} />
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
    const lang = getLang();

    const subscriptions = {
      gameRequests: Meteor.subscribe("game_requests"),
      gameHistory: Meteor.subscribe("game_history"),
      clientInternationalization: Meteor.subscribe("clientInternationalization", lang),
    };

    return {
      isReady: isReadySubscriptions(subscriptions),
      i18nTranslate: ClientInternationalizationCollection.findOne(),
      cssStyles: mongoCss.find().fetch(),
      currentRoles: Meteor.roleAssignment.find().fetch(),
    };
  }),
  injectSheet(defaultAppStyles)
)(App);
