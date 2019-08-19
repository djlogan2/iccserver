import React, { Component } from "react";
import i18n from "meteor/universe:i18n";

class MenuLinks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: "Play"
    };
  }
  _handleClick(menuItem) {
     this.setState({ active: menuItem });
  }
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    const activeStyle = { color: "#ff3333" };
    let translator = i18n.createTranslator(
      "Common.menuLinkLabel",
      this.getLang()
    );
    let linksMarkup = this.props.links.map((link, index) => {
      let linkMarkup = (
        <a
          href={link.link}
          style={this.state.active === link.label ? activeStyle : {}}
          onClick={this._handleClick.bind(this, link.label)}
        >
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
      <ul className="list-sidebar bg-defoult list-unstyled components desktop">
        {linksMarkup}
      </ul>
    );
  }
}
export default MenuLinks;
