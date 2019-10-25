import { Meteor } from "meteor/meteor";
import { ClientMessages } from "../../imports/collections/ClientMessages";
import { Logger } from "./Logger";

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
    if (this.user && message_identifier) {
      const parms = [];
      if (message) parms.push(message);
      if (reason) parms.push(reason);
      ClientMessages.sendMessageToClient(
        this.user,
        message_identifier,
        "SERVER_ERROR",
        parms
      );
    }
  }
};