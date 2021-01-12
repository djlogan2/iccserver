import React, { Component } from "react";
import PropTypes from "prop-types";

class Tab extends Component {
  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label, src, tabListName, cssManager }
    } = this;

    let activeTabName;

    if (activeTab === label) {
      activeTabName = label;
    }

    return (
      <li style={cssManager.tabListItem(activeTabName, label)} onClick={onClick}>
        <img src={src} alt={label} style={cssManager.TabIcon(tabListName)} />
        {label}
      </li>
    );
  }
}

Tab.propTypes = {
  activeTab: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  src: PropTypes.any,
  onClick: PropTypes.func.isRequired,
  cssManager: PropTypes.object.isRequired
};

export default Tab;
