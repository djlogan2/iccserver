import React from "react";
import injectSheet from "react-jss";
import { get, isEqual } from "lodash";

const withDynamicStyles = (name) => (WrappedComponent) => {
  return class extends React.Component {
    state = {
      styles: null,
    };

    componentDidMount() {
      this.getStyles();
    }

    componentDidUpdate(prevProps) {
      if (!isEqual(this.props.css, prevProps.css)) {
        this.getStyles();
      }
    }

    getStyles = () => {
      try {
        const { type, ...styles } = get(this.props, name);
        this.setState({ styles });
      } catch (e) {
        this.setState({ styles: {} });
      }
    };

    render() {
      const { styles } = this.state;
      const { css, ...props } = this.props;

      if (!styles) {
        return null;
      }

      const Component = injectSheet(styles)(WrappedComponent);

      return <Component {...props} />;
    }
  };
};

export { withDynamicStyles };
