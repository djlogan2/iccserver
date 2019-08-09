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

    let tabName;

    if (activeTab === label) {
      tabName = activeTab;
    }

    return (
      <li style={this.props.CssManager.tabListItem(tabName)} onClick={onClick}>
        <img src={src} alt="" style={this.props.CssManager.TabIcon()} />
        {label}
      </li>
    );
  }
}

export default Tab;
