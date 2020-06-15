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

  handleMygame = () => {
    // this.props.gameHistory("mygame");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push('/my-games');
  };

  handleUploadpgn = () => {
    // this.props.gameHistory("uploadpgn");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push('/upload-pgn');
  };

  handlePlay = () => {
    // this.props.examineAction("play");
    this.props.history.push('/play');
  };

  handleExamine = () => {
    this.props.history.push('/examine');
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
    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }
    return (
      <div
        className={
          this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
        }
      >
        <div className="image">
          <img src={this.props.cssmanager.buttonBackgroundImage("logoWhite")} alt="logo" />
        </div>
        <button style={this.props.cssmanager.buttonStyle(buttonStyle)} onClick={this.toggleMenu}>
          <img
            src={this.props.cssmanager.buttonBackgroundImage("toggleMenu")}
            style={this.props.cssmanager.toggleMenuHeight()}
            alt="toggle menu"
          />
        </button>

        <MenuLinks
          onMygame={this.handleMygame}
          onUploadpgn={this.handleUploadpgn}
          onPlay={this.handlePlay}
          onExamine={this.handleExamine}
          onLogout={this.handleLogout}

          cssmanager={this.props.cssmanager}
          history={this.props.history}
          gameHistory={this.props.gameHistory}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
export default withRouter(LeftSidebar);
