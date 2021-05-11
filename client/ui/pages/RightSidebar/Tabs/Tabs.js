import React, { Component } from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";

class Tabs extends Component {
  constructor(props) {
    super(props);

    const df = props.defultactive || 0;

    this.state = {
      activeTab: this.props.children[df].props.label,
      onHover: "",
      hoverOut: "",
    };
  }

  onClickTabItem = (activeTab) => {
    this.setState({ activeTab });
  };

  render() {
    const {
      onClickTabItem,
      props: { children, cssManager },
      state: { activeTab, onHover, hoverOut },
    } = this;

    let { tabName } = this.props;

    return (
      <div style={cssManager.tab()}>
        <ol style={cssManager.tabList(tabName)}>
          {children.map((child) => {
            let { label, imgsrc, hoverSrc } = child.props;
            if (
              (label === activeTab && tabName === "bottom") ||
              (tabName === "bottom" && onHover === label)
            ) {
              imgsrc = hoverSrc;
            }
            return (
              <Tab
                cssManager={cssManager}
                tabListName={tabName}
                activeTab={activeTab}
                onHover={onHover}
                hoverOut={hoverOut}
                key={label}
                label={label}
                src={imgsrc}
                onClick={onClickTabItem}
              />
            );
          })}
        </ol>
        <div style={cssManager.tabContent()}>
          {children.map((child) => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  children: PropTypes.instanceOf(Array).isRequired,
  cssManager: PropTypes.object.isRequired,
  defultactive: PropTypes.number,
};

export default Tabs;
