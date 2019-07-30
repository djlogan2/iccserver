import React, { Component } from "react";
import PropTypes from "prop-types";

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    src: PropTypes.any,
    onClick: PropTypes.func.isRequired
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label, src }
    } = this;
    let className = "tab-list-item";
    if (activeTab === label) {
      className += " tab-list-active";
    }

    return (
      <li className={className} onClick={onClick}>
        <img src={src} alt="" />
        {label}
      </li>
    );
  }
}

export default Tab;
