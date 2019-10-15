import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { i18n } from "./i18n";
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
//           {_id: mongoid, datecreated: 2019-10-10 12:12:12, identifier: "required-custom-identifier", message: "i18n-message-id", parameters: ["parameter", "array"]}

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

const ClientMessages = {};
export default ClientMessages;

ClientMessages.sendMessageToClient = function(
  user,
  client_identifier,
  i8n_message,
  parameter_array
) {
  check(user, Match.OneOf(Object, Meteor.Collection.ObjectID));
  check(client_identifier, String);
  check(i8n_message, Number);
  check(parameter_array, [Match.Any]);

  const id = typeof user === "object" ? user._id : user;
  const touser = Meteor.users.findOne({ _id: id, loggedOn: true });
  if (!touser) return;
  // Actually, let's go ahead and i18n convert this puppy here, and just save the message itself!
  const locale = touser.locale || "en_US";
  const message = i18n.localizeMessage(locale, i8n_message, parameter_array);
  ClientMessagesCollection.insert({
    to: id,
    client_identifier: client_identifier,
    message: message
  });
};

addLogoutHook(function(userId) {
  log.debug("runOnLogout: " + userId);
  ClientMessagesCollection.remove({ to: userId });
});
