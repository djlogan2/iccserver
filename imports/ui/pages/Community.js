import React, { Component } from "react";
import ExaminePage from "./components/ExaminePage";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import Loading from "../pages/components/Loading";
import AppWrapper from "../pages/components/AppWrapper";
import Chess from "chess.js";
import { Link } from "react-router-dom";
import { Tracker } from "meteor/tracker";
import { ClientMessagesCollection, Game, Chat, ImportedGameCollection, GameHistoryCollection, GameRequestCollection, mongoCss, mongoUser } from "../../api/collections";
import { TimestampClient } from "../../../lib/Timestamp";

const log = new Logger("client/Community");

class Community extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <AppWrapper>Community</AppWrapper>;
    // return <div className="examine">Community</div>;
  }
}

export default withTracker(props => {
  return {
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Community);
