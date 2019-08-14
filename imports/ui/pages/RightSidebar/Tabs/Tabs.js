import React, { Component } from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";
import CssManager from "../../../pages/components/Css/CssManager";

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: this.props.children[0].props.label,
      onHover: "",
      hoverOut: ""
    };
  }
  onClickTabItem = tab => {
    this.setState({ activeTab: tab });
  };
  mouseOver = label => {
    this.setState({ onHover: label });
  };

  mouseOut = label => {
    console.log("hoverOut: " + label);
    this.setState({ hoverOut: label });
  };
  render() {
    const {
      onClickTabItem,
      mouseOver,
      mouseOut,
      props: { children },
      state: { activeTab, onHover, hoverOut }
    } = this;
    let tabName = this.props.tabName;

    return (
      <div style={CssManager.tab()}>
        <ol style={CssManager.tabList(tabName)}>
          {children.map(child => {
            let { label, imgsrc, hoverSrc } = child.props;
            if (
              (label === activeTab && tabName === "bottom") ||
              (tabName === "bottom" && onHover === label)
            ) {
              imgsrc = hoverSrc;
            }
            return (
              <Tab
                tabListName={tabName}
                activeTab={activeTab}
                onHover={onHover}
                hoverOut={hoverOut}
                key={label}
                label={label}
                src={imgsrc}
                onClick={onClickTabItem}
                onMouseEnter={mouseOver}
                onMouseLeave={mouseOut}
              />
            );
          })}
        </ol>
        <div style={CssManager.tabContent()}>
          {children.map(child => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

export default Tabs;
