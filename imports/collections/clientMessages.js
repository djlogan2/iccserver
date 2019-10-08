import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { addLogoutHook } from "./users";

import { Logger } from "../../lib/server/Logger";

let log = new Logger("clientMessages_js");
const clientMessages = new Mongo.Collection("client_messages");

Meteor.publish("client_messages", function() {
  return clientMessages.find({ to: this._userId });
});

Meteor.methods({
  "acknowledge.client.message": function(id) {
    const rec = clientMessages.findOne({ _id: id });
    if (!rec || !rec.count()) return; // TODO: Decide, should we throw an error?
    if (rec.to !== this.userId) return; // TODO: Decide, should we throw an error?
    clientMessages.remove({ _id: id });
  }
});

export default clientMessages;

export function sendMessageToClient(user, message) {
  const id = typeof user === "object" ? user._id : user;
  clientMessages.insert({ to: id, message: message });
}

addLogoutHook(function(userId) {
  log.debug("runOnLogout: " + userId);
  clientMessages.remove({ to: userId });
});
