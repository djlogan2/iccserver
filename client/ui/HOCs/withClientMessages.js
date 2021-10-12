import React from "react";
import { notification } from "antd";
import { Meteor } from "meteor/meteor";

const withClientMessages = (WrappedComponent) => {
  return class extends React.Component {
    displayClientMessage = (message, identifier, id) => {
      notification.open({
        message,
        description: identifier,
      });

      Meteor.call("acknowledge.client.message", id);
    };

    render() {
      const { userClientMessages } = this.props;

      const filtered = userClientMessages.filter(
        (message) => message.client_identifier === "matchRequest"
      );

      filtered.forEach((clientMessage) => {
        this.displayClientMessage(
          clientMessage.message,
          clientMessage.message_identifier,
          clientMessage._id
        );
      });

      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withClientMessages;
