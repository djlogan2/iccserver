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
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NotFound from "./ui/pages/NotFound/NotFound";
import AuthGuard from "./routes/guards/authGuard";
import NonAuthGuard from "./routes/guards/nonAuthGuard";
import { nonAuthRoutes, authRoutes } from "./routes/routes";

import { getLang, isReadySubscriptions, updateLocale } from "./utils/utils";
import injectSheet from "react-jss";

const defaultAppStyles = {
  loadingSidebar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

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
    const userRoles = currentRoles.map((role) => role?.role?._id);
    const userId = Meteor.userId();

    return isReady ? (
      <Router>
        <Switch>
          {nonAuthRoutes.map((route) => (
            <NonAuthGuard key={route.path} component={route.component} auth={!!userId} {...route} />
          ))}
          {authRoutes.map((route) => (
            <AuthGuard
              key={route.path}
              component={route.component}
              auth={!!userId}
              currentRoles={userRoles}
              {...route}
            />
          ))}
          <Route component={NotFound} />
        </Switch>
      </Router>
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
