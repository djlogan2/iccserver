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
      activeTab: this.props.children[0].props.label
    };
  }
  onClickTabItem = tab => {
    this.setState({ activeTab: tab });
  };
  render() {
    const {
      onClickTabItem,
      props: { children },
      state: { activeTab }
    } = this;
    let tabName = this.props.tabName;
    return (
      <div style={CssManager.tab()}>
        <ol style={CssManager.tabList(tabName)}>
          {children.map(child => {
            const { label, imgsrc } = child.props;

            return (
              <Tab
                tabListName={tabName}
                activeTab={activeTab}
                key={label}
                label={label}
                src={imgsrc}
                onClick={onClickTabItem}
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
