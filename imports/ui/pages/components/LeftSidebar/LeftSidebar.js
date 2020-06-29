import React, { Component } from "react";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import { Meteor } from "meteor/meteor";

class LeftSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  handleCommunity = () => {
    // this.props.gameHistory("mygame");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push("/community");
  };

  handleUploadpgn = () => {
    // this.props.gameHistory("uploadpgn");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push("/upload-pgn");
  };

  handlePlay = () => {
    // this.props.examineAction("play");
    this.props.history.push("/play");
  };

  handleExamine = () => {
    this.props.history.push("/examine");
    // Meteor.call(
    //   "startLocalExaminedGame",
    //   "startlocalExaminedGame",
    //   "Mr white",
    //   "Mr black",
    //   0,
    //   (error, response) => {
    //     if (response) {
    //       this.props.history.push('/examine');
    //       // this.props.examineAction(action);
    //     }
    //   }
    // );
  };

  handleLogout = () => {
    Meteor.logout(err => {
      if (err) {
      } else {
        window.location.href = "/login";
      }
    });
  };

  render() {
    return (
      <div
        className={
          this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
        }
      >
        <div className="sidebar__logo" />
        <button className="sidebar__burger-btn" onClick={this.toggleMenu} />

        <MenuLinks
          onCommunity={this.handleCommunity}
          onUploadpgn={this.handleUploadpgn}
          onPlay={this.handlePlay}
          onExamine={this.handleExamine}
          onLogout={this.handleLogout}
          history={this.props.history}
          gameHistory={this.props.gameHistory}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
export default withRouter(LeftSidebar);
