import React from "react";
import i18n from "meteor/universe:i18n";

export const translate = namespace => WrappedComponent => {
  return class extends React.Component {
    getLang = () => {
      return (
        (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        navigator.browserLanguage ||
        navigator.userLanguage ||
        "en-US"
      );
    };

    render() {
      const translator = i18n.createTranslator(namespace, this.getLang());
      return <WrappedComponent {...this.props} translate={translator} />;
    }
  };
};
