import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { addLogoutHook } from "./users";

import { Logger } from "../../lib/server/Logger";

let log = new Logger("clientMessages_js");
export const ClientMessagesCollection = new Mongo.Collection("client_messages");

//
// TODO: OK, so we need more structure here. For client messages, we need two things:
//       (1) Incoming commands, say a game seek, needs to have some sort of client-defined identifier that says "Any messsage regarding this seek should be logged into client_messages with this identifier"
//       (2) Then of course our schema, and these methods, need to accept, perhaps even require, some type of identifier. If a message has no identifier,
//           let's say "server failure" or something, then the identifier could be something generic, like "global", or "system" or something.
//       So basically, our schema needs to be something like this:
//           {_id: mongoid, datecreated: 2019-10-10 12:12:12, identifier: "required-custom-identifier", message: "i8n-message-id", parameters: ["parameter", "array"]}

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
