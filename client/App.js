import React from "react";
import { compose } from "redux";
import { Spin, Space, Col } from "antd";
import injectSheet from "react-jss";
import i18n from "meteor/universe:i18n";
import "antd/dist/antd.css";

import "../imports/css/GameHistory.css";
import "../imports/css/Examine.css";
import "../imports/css/ExamineSidebarTop.css";
import "../imports/css/FenPgn.css";
import "../imports/css/Loading.css";

import "../imports/css/ExamineObserveTab.css";
import "../imports/css/ExamineRightSidebar.css";
import "../imports/css/PlayRightSidebar.css";
import "../imports/css/GameControlBlock.css";

import { Routes } from "./routes/routes.js";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { defaultAppStyles } from "./defaultAppStyles";
import { ClientInternationalizationCollection, mongoCss } from "../imports/api/client/collections";
import { getLang, isReadySubscriptions, updateLocale } from "./utils/utils";

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
