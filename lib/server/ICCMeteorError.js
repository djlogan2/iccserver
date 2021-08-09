import { Meteor } from "meteor/meteor";
import { ClientMessages } from "../../imports/collections/ClientMessages";
import { Logger } from "./Logger";
import axios from "axios";

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
      const url = "https://slack.com/api/chat.postMessage";

      axios.post(
        url,
        {
          channel: "#notifications",
          text: `Message: ${message} \nReason: ${reason} \nMessage identifier: ${message_identifier}\nUser id: ${this.user?._id}`,
        },
        {
          headers: {
            authorization: `Bearer xoxb-1460113808613-2346389888119-mcOqW49VMAdAs46CK86U85Dm`,
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
    }
  }
};
