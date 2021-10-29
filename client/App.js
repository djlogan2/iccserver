import addFont from "add-font";
import { Col, Space, Spin } from "antd";
import "antd/dist/antd.css";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import i18n from "meteor/universe:i18n";
import React from "react";
import { compose } from "redux";
import { ClientInternationalizationCollection, mongoCss } from "../imports/api/client/collections";
import "../imports/css/FenPgn.css";
import "../imports/css/Loading.css";
import "../imports/css/PlayRightSidebar.css";
import { FIGURE_FONT } from "./constants/resourceConstants";
import { Routes } from "./routes/routes.js";
import { withDynamicStyles } from "./ui/HOCs/withDynamicStyles";
import { getLang, isReadySubscriptions, updateLocale } from "./utils/utils";

class App extends React.Component {
  render() {
    const { isReady, classes, i18nTranslate, currentRoles } = this.props;
    addFont("fonts/DIATTFRI.ttf", FIGURE_FONT);

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
      css: mongoCss.findOne(),
      currentRoles: Meteor.roleAssignment.find().fetch(),
    };
  }),
  withDynamicStyles("css.appCss")
)(App);
