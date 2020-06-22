import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";

import { Row } from "antd";


import LeftSidebar from "./LeftSidebar/LeftSidebar";

import "antd/dist/antd.css";
import "react-chessground/dist/assets/theme.css";

import "./../css/developmentboard.css";
import "./../css/Spare.css";
import "./../css/Editor.css";
import "./../css/AppWrapper.css";
import "./../css/GameHistory.css";
import "./../css/Examine.css";
import "./../css/ExamineSidebarTop.css";
import "./../css/ChatApp.css";
import "./../css/FenPgn.css";
import "./../css/Loading.css";

import "./../css/ExamineRightSidebar.css";

const AppWrapper = ({ className, children, cssManager }) => {
  return (
    <div className={`app-wrapper`}>
      <LeftSidebar cssmanager={cssManager} />
      <Row className={`app-wrapper__row ${className}`}>{children}</Row>
    </div>
  );
};

export default withTracker(props => {
  return {}
})(AppWrapper);
