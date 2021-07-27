import React, { Component } from "react";
import { Popover, Button } from "antd";
import { compose } from "redux";
import BellOutlined from "@ant-design/icons/BellOutlined";
import { withTracker } from "meteor/react-meteor-data";
import { ClientMessagesCollection } from "../../../../../imports/api/client/collections";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/ClientMessagesPopover_js");

class ClientMessagesPopover extends Component {
  handleClick = () => {
    const { clientMessages } = this.props;
    const ids = clientMessages.map((message) => message._id);

    Meteor.call("acknowledge.client.messages", ids, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };
  render() {
    const { clientMessages } = this.props;

    return clientMessages && clientMessages.length ? (
      <Popover
        content={clientMessages.map((message) => {
          return (
            <p key={message._id}>
              {message.message} {message.client_identifier}
            </p>
          );
        })}
        title={() => {
          return (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Client messages</span>
              <Button type="primary" onClick={this.handleClick}>
                Clear
              </Button>
            </div>
          );
        }}
        placement="bottomLeft"
        trigger="click"
      >
        <BellOutlined style={{ marginTop: "15px", cursor: "pointer" }} />
      </Popover>
    ) : null;
  }
}

export default compose(
  withTracker(() => {
    return {
      clientMessages: ClientMessagesCollection.find({
        to: Meteor.userId(),
      }).fetch(),
    };
  })
)(ClientMessagesPopover);
