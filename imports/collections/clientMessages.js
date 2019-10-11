import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { addLogoutHook } from "./users";

import { Logger } from "../../lib/server/Logger";

let log = new Logger("clientMessages_js");
export const ClientMessagesCollection = new Mongo.Collection("client_messages");

Meteor.publish("client_messages", function() {
  return ClientMessagesCollection.find({ to: this.userId });
});

Meteor.methods({
  "acknowledge.client.message": function(id) {
    const rec = ClientMessagesCollection.findOne({ _id: id });
    if (!rec || !rec.count()) return; // TODO: Decide, should we throw an error?
    if (rec.to !== this.userId) return; // TODO: Decide, should we throw an error?
    ClientMessagesCollection.remove({ _id: id });
  }
});

export default ClientMessagesCollection;

export function sendMessageToClient(user, message) {
  const id = typeof user === "object" ? user._id : user;
  const touser = Meteor.users.findOne({_id: id, loggedOn: true });
  if (!touser) return;
  ClientMessagesCollection.insert({ to: id, message: message });
}

addLogoutHook(function(userId) {
  log.debug("runOnLogout: " + userId);
  ClientMessagesCollection.remove({ to: userId });
});
