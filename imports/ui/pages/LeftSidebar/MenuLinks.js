import React, { Component } from "react";

class MenuLinks extends Component {
  render() {
    let linksMarkup = this.props.links.map((link, index) => {
      let linkMarkup = link.active ? (
        <a href={link.link} className="active">
          <img src={link.src} alt="" /> <span>{link.label}</span>
        </a>
      ) : (
        <a href={link.link}>
          <img src={link.src} alt="" /> <span>{link.label}</span>
        </a>
      );

      return (
        <li key={index} className="show-lg">
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
