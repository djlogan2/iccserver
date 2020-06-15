import React, { Component } from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/Tabs_js");

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
    cssmanager: PropTypes.object.isRequired,
    defultactive: PropTypes.number
  };

  constructor(props) {
    super(props);
    let df = 0;
    df = this.props.defultactive || 0;

    this.state = {
      activeTab: this.props.children[df].props.label,
      onHover: "",
      hoverOut: ""
    };
  }
  onClickTabItem = tab => {
    this.setState({ activeTab: tab });
  };
  /* mouseOver = label => {
    this.setState({ onHover: label });
  };

  mouseOut = label => {
    this.setState({ hoverOut: label });
  }; */
  render() {
    const {
      onClickTabItem,
      /*   mouseOver,
      mouseOut, */
      props: { children },
      state: { activeTab, onHover, hoverOut }
    } = this;
    let tabName = this.props.tabName;

    return (
      <div style={this.props.cssmanager.tab()}>
        <ol style={this.props.cssmanager.tabList(tabName)}>
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
                cssmanager={this.props.cssmanager}
                tabListName={tabName}
                activeTab={activeTab}
                onHover={onHover}
                hoverOut={hoverOut}
                key={label}
                label={label}
                src={imgsrc}
                onClick={onClickTabItem}
                /*    onMouseEnter={mouseOver}
                onMouseLeave={mouseOut} */
              />
            );
          })}
        </ol>
        <div style={this.props.cssmanager.tabContent()}>
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
