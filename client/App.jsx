import React from "react";
import { compose } from "redux";
import { Spin, Space, Col } from "antd";
import injectSheet from "react-jss";
import i18n from "meteor/universe:i18n";

import { Routes } from "../imports/startup/client/routes.jsx";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { defaultAppStyles } from "./defaultAppStyles";
import { ClientInternationalizationCollection } from "../imports/api/client/collections";
import { isReadySubscriptions, updateLocale } from "../imports/utils/utils";

class App extends React.Component {
  render() {
    const { isReady, classes, i18nTranslate } = this.props;

    if (i18nTranslate) {
      i18n.addTranslations(updateLocale(i18nTranslate.locale), i18nTranslate.i18n);

      i18n.setOptions({
        defaultLocale: updateLocale(i18nTranslate.locale)
      });
    }

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
    const lang =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US";

    const subscriptions = {
      css: Meteor.subscribe("css"),
      gameRequests: Meteor.subscribe("game_requests"),
      gameHistory: Meteor.subscribe("game_history"),
      clientInternationalization: Meteor.subscribe("clientInternationalization", lang)
    };

    return {
      isReady: isReadySubscriptions(subscriptions),
      i18nTranslate: ClientInternationalizationCollection.findOne()
    };
  }),
  injectSheet(defaultAppStyles)
)(App);
