import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
import { Meteor } from "meteor/meteor";
import ModalContext from "./../ModalContext";
import { links, sidebarBottom } from "./../hardcode.json";

class MenuLinks extends Component {
  static contextType = ModalContext;
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: Meteor.userId() !== null
    };
    this.logout = this.logout.bind(this);
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

  startLocalExaminedGame(action) {
    Meteor.call(
      "startLocalExaminedGame",
      "startlocalExaminedGame",
      "Mr white",
      "Mr black",
      0,
      (error, response) => {
        if (response) {
          this.props.examineAction(action);
        }
      }
    );
  }

  handleClick = (e, label) => {
    e.preventDefault();
    if (label === "mygame") {
      this.props.gameHistory(label);
      const data = this.context;
      data.toggleModal(true);
    }
    if (label === "play") this.props.examineAction(label);
    if (label === "examine") this.startLocalExaminedGame(label);
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

    let linksMarkup = links.map((link, index) => {
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
        <li className="menu-link__item" key={index}>
          {linkMarkup}
        </li>
      );
    });

    return (
      <div className="menu-links">
        <ul className="list-sidebar bg-defoult list-unstyled components desktop">{linksMarkup}</ul>
        <div className="menu-links__bottom">
          {sidebarBottom.map((link, index) => {
            return (
              <li key={index} className="menu-link__item" key={index}>
                <a href="#" onClick={e => this.handleClick(e, link.label)}>
                  <img src={link.src} alt="" /> <span>{translator(link.label)}</span>
                </a>
              </li>
            );
          })}
        </div>
      </div>
    );
  }
}
export default MenuLinks;
