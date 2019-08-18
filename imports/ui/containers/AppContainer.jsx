import React, { Component } from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Logger } from "../../../lib/client/Logger";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";

const log = new Logger("client/AppContainerDJL");
const mongoCss = new Mongo.Collection("css");
const mongoUser = new Mongo.Collection("userData");

export default class AppContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      subscription: {
        css: Meteor.subscribe("css"),
        user: Meteor.subscribe("userData")
      },
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
  }

  systemCSS() {
    console.log("systemCSS");
    return mongoCss.findOne({ type: "system" });
  }

  boardCSS() {
    console.log("boardCSS");
    return mongoCss.findOne({
      $and: [{ type: "board" }, { name: "default-user" }]
    });
  }

  userRecord() {
    console.log("userRecord");
    return mongoUser.find().fetch();
  }

  isAuthenticated() {
    console.log("isAuthenticated");
    return Meteor.userId() !== null;
  }

  componentWillUnmount() {
    this.state.subscription.css.stop();
    this.state.subscription.user.stop();
  }

  componentWillMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/sign-up");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }

  logout(e) {
    e.preventDefault();
    Meteor.logout(err => {
      if (err) {
        log.error(err.reason);
      } else {
        this.props.history.push("/login");
      }
    });
    this.props.history.push("/login");
  }

  render() {
    const systemCSS = this.systemCSS();
    const boardCSS = this.boardCSS();

    if (
      systemCSS === undefined ||
      boardCSS === undefined ||
      systemCSS.length === 0 ||
      boardCSS.length === 0
    )
      return <div>Loading...</div>;

    const css = new CssManager(this.systemCSS(), this.boardCSS());

    //
    return (
      <div>
        <MainPage cssmanager={css} />
      </div>
    );
  }
}
