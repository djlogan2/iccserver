import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
import CssManager from "../../pages/components/Css/CssManager";

class MenuLinks extends Component {
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
    let translator = i18n.createTranslator(
      "Common.menuLinkLabel",
      MenuLinks.getLang()
    );
    let linksMarkup = this.props.links.map((link, index) => {
      let linkMarkup = link.active ? (
        <a href={link.link} className="active">
          <img src={link.src} alt="" /> <span>{translator(link.label)}</span>
        </a>
      ) : (
        <a href={link.link}>
          <img src={link.src} alt="" /> <span>{translator(link.label)}</span>
        </a>
      );

      return (
        <li key={index} style={CssManager.showLg()}>
          {linkMarkup}
        </li>
      );
    });

    return (
      <ul className="list-sidebar bg-defoult list-unstyled components desktop">
        {linksMarkup}
      </ul>
    );
  }
}
export default MenuLinks;
