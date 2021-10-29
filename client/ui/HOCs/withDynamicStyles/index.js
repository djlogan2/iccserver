import React from "react";
import injectSheet from "react-jss";
import { get } from "lodash";

const withDynamicStyles = (name) => (WrappedComponent) => {
  return class extends React.Component {
    state = {
      styles: null,
    };

    componentDidUpdate(prevProps) {
      if (this.props.css !== prevProps.css) {
        this.getStyles();
      }
    }

    getStyles = () => {
      const { type, ...styles } = get(this.props, name);
      this.setState({ styles });
    };

    render() {
      const { styles } = this.state;

      if (!styles) {
        return null;
      }

      const Component = injectSheet(styles)(WrappedComponent);

      return <Component {...this.props} />;
    }
  };
};

export { withDynamicStyles };
