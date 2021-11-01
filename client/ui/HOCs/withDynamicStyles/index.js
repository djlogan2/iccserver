import React from "react";
import injectSheet from "react-jss";
import { get, isEqual } from "lodash";
import PropTypes from "prop-types";

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
      const { type, ...styles } = get(this.props, name);
      this.setState({ styles });
    };

    render() {
      const { styles } = this.state;

      if (!styles) {
        return null;
      }

      const { css, ...props } = this.props;

      const Component = injectSheet(styles)(WrappedComponent);

      return <Component {...props} />;
    }
  };
};

withDynamicStyles.propTypes = {
  css: PropTypes.object.isRequired,
};

export { withDynamicStyles };
