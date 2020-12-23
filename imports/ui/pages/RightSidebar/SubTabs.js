import React, { Component } from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

import Tab from "./Tab";

class SubTabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: get(props, "children[0].props.label")
    };
  }

  onClickTabItem = activeTab => {
    this.setState({ activeTab });
  };

  render() {
    const {
      onClickTabItem,
      props: { children, cssManager },
      state: { activeTab }
    } = this;

    return (
      <div className="tab">
        <ol className="tab-list">
          {children.map(child => {
            const { label } = child.props;

            return (
              <Tab
                activeTab={activeTab}
                key={label}
                label={label}
                onClick={onClickTabItem}
                cssManager={cssManager}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {children.map(child => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

SubTabs.propTypes = {
  children: PropTypes.instanceOf(Array).isRequired,
  cssManager: PropTypes.object.isRequired
};

export default SubTabs;
