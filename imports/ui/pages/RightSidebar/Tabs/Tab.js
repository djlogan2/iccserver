import React, { Component } from "react";
import PropTypes from "prop-types";
import CssManager from "../../../pages/components/Css/CssManager";

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
      props: { activeTab, label, src, tabListName }
    } = this;

    let tabName;

    if (activeTab === label) {
      tabName = activeTab;
    }

    return (
      <li style={CssManager.tabListItem(tabName)} onClick={onClick}>
        <img
          src={src}
          alt=""
          style={CssManager.TabIcon(tabListName)}
        />
        {label}
      </li>
    );
  }
}

export default Tab;
