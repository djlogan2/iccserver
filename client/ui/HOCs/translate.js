import React from "react";
import i18n from "meteor/universe:i18n";

export const translate = (namespace) => (WrappedComponent) => {
  return class extends React.Component {
    render() {
      const translator = i18n.createTranslator(namespace);
      return <WrappedComponent {...this.props} translate={translator} />;
    }
  };
};
