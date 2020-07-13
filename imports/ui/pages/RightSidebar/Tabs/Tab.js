import React, { Component } from "react";
import PropTypes from "prop-types";

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    src: PropTypes.any,
    onClick: PropTypes.func.isRequired
    //   onMouseEnter: PropTypes.func.isRequired,
    //   onMouseLeave: PropTypes.func.isRequired
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };
  /*  onMouseEnter = () => {
    const { label, onMouseEnter } = this.props;
    onMouseEnter(label);
  };
  onMouseLeave = () => {
    const { label, onMouseLeave } = this.props;
    onMouseLeave(label);
  }; */
  render() {
    const {
      onClick,
      /*  onMouseEnter,
      onMouseLeave, */
      props: { activeTab, label, onHover, hoverOut, src, tabListName }
    } = this;

    let activeTabName;
    let hover;
    if (activeTab === label) {
      activeTabName = label;
    }

    return (
      <li
        // style={{cursor: 'pointer', display: 'block'}}
        style={this.props. cssManager.tabListItem(activeTabName, label)}
        onClick={onClick}
        /*    onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave} */
      >
        <img src={src} alt="" style={this.props. cssManager.TabIcon(tabListName)} />
        {label}
      </li>
    );
  }
}

export default Tab;
