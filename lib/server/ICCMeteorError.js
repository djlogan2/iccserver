import { Meteor } from "meteor/meteor";
import { ClientMessages } from "../../imports/collections/ClientMessages";
import { Logger } from "./Logger";
import slackNotifiy from "slack-notify";

const slack = slackNotifiy(
  "https://hooks.slack.com/services/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"
);

const log = new Logger("ICCMeteorError");

export const ICCMeteorError = class extends Meteor.Error {
  constructor(message_identifier, message, reason) {
    super(message, reason);
    try {
      this.user = Meteor.user();
    } catch (e) {
      // No user
    }
    this.message_identifier = message_identifier;
    log.error(message, reason, this.user ? this.user._id : undefined);
    if (this.user && message_identifier)
      ClientMessages.sendMessageToClient(
        this.user,
        message_identifier,
        "SERVER_ERROR",
        message || "",
        reason || ""
      );
    if (process.env.NODE_ENV !== "development") {
      slack.send({
        channel: "#notifications",
        text: `Message: ${message} \nReason: ${reason} \nMessage identifier: ${message_identifier}\nUser id: ${this.user?._id}`,
        username: "Notifications bot",
      });
    }
  }
};
