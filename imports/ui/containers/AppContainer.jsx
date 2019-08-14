import React, { Component } from "react";
import MainPage from "./../pages/MainPage";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Logger } from "../../../lib/client/Logger";
import { withTracker } from "meteor/react-meteor-data";

const log = new Logger("client/AppContainerDJL");

class AppContainerComponent extends Component {
  constructor(props) {
    super(props);
    //--
    console.log("css=" + props.css);
    console.log("user=" + props.user);
    console.log("loading=" + props.loading);
    console.log("cssExists=" + props.cssExists);
    console.log("userExists=" + props.userExists);
    //--
    this.state = AppContainer.getMeteorData();
    this.logout = this.logout.bind(this);
  }

  static getMeteorData() {
    return { isAuthenticated: Meteor.userId() !== null };
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
    //let authnticate =this.state;
    if (this.state.isAuthenticated === true)
      return (
        <div>
          <MainPage />
        </div>
      );
    else
      return (
        <div>
          <nav className="navbar navbar-default navbar-static-top">
            <div className="container">
              <div className="navbar-header">
                <a className="navbar-brand" href="#/">
                  Chess App
                </a>
              </div>
              <div className="navbar-collapse">
                <ul className="nav navbar-nav navbar-right">
                  <li>
                    <a href="#/" onClick={this.logout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      );
  }
}

AppContainerComponent.propTypes = {
  css: React.PropTypes.object,
  user: React.PropTypes.object,
  loading: React.PropTypes.bool,
  cssExists: React.PropTypes.bool,
  userExists: React.PropTypes.bool
};

const mongoCss = Mongo.Collection("css");
const mongoUser = Mongo.Collection("userData");

const AppContainer = withTracker(() => {
  const cssHandle = Meteor.subscribe("css");
  const udHandle = Meteor.subscribe("userData");
  const loading = !cssHandle.ready() || !udHandle.ready();
  const css = mongoCss.find();
  const user = mongoUser.find();
  return {
    loading: loading,
    css: css,
    user: user,
    cssExists: !loading && !!css,
    userExists: !loading && !!user
  };
})(AppContainerComponent);

export default AppContainer;
