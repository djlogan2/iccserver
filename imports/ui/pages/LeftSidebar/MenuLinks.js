import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
import { Meteor } from "meteor/meteor";

class MenuLinks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
  }
  componentWillMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  componentDidMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  logout() {
    Meteor.logout(err => {
      if (err) {
        // console.log(err.reason);
      } else {
        this.props.history.push("/login");
      }
    });
  }
  handleClick = (e, label) => {
    e.preventDefault();
    if (label === "mygame") this.props.gameHistory(label);
    if (label === "play") this.props.examineAction(label);
    if (label === "logout")
      Meteor.logout(err => {
        if (err) {
          // console.log(err.reason);
        } else {
          window.location.href = "/login";
        }
      });
  };

  static getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    let translator = i18n.createTranslator("Common.menuLinkLabel", MenuLinks.getLang());

    let linksMarkup = this.props.links.map((link, index) => {
      let linkMarkup = link.active ? (
        <a href="#" className="active" onClick={e => this.handleClick(e, link.label)}>
          <img src={link.src} alt="" /> <span>{translator(link.label)}</span>
        </a>
      ) : (
        <a href="#" onClick={e => this.handleClick(e, link.label)}>
          <img src={link.src} alt="" /> <span>{translator(link.label)}</span>
        </a>
      );

      return (
        <li key={index} style={this.props.cssmanager.showLg()}>
          {linkMarkup}
        </li>
      );
    });

    return (
      <ul className="list-sidebar bg-defoult list-unstyled components desktop">{linksMarkup}</ul>
    );
  }
}
export default MenuLinks;
