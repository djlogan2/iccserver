import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { i18n } from "./i18n";
import { addLogoutHook } from "./users";

import { Logger } from "../../lib/server/Logger";

let log = new Logger("clientMessages_js");
const ClientMessagesCollection = new Mongo.Collection("client_messages");

//
// You can put whatever you want in the array for the parameters. It's for documentation only at the time of this writing.
// The code checks for the parameter COUNT, but does not otherwise verify.
//
export const DefinedClientMessagesMap = {
  UNABLE_TO_LOGON: { parameters: ["player_name"] },
  UNABLE_TO_PLAY_RATED_GAMES: {},
  UNABLE_TO_PLAY_UNRATED_GAMES: {}
};

Meteor.publish("client_messages", function() {
  return ClientMessagesCollection.find({ to: this.userId });
});

Meteor.methods({
  "acknowledge.client.message": function(id) {
    check(id, Meteor.Collection.ObjectID);
    const rec = ClientMessagesCollection.findOne({ _id: id });
    if (!rec || !rec.count())
      throw Meteor.Error(
        "Why are we here? We should not be deleting a nonexistant client message"
      );
    if (rec.to !== this.userId)
      throw Meteor.Error(
        "Why are we here? We should not be deleting a client message that does not belong to us"
      );
    ClientMessagesCollection.remove({ _id: id });
  }
});

export const ClientMessages = {};

ClientMessages.sendMessageToClient = function(
  user,
  client_identifier,
  i8n_message,
  parameter_array
) {
  check(user, Match.OneOf(Object, Meteor.Collection.ObjectID));
  check(client_identifier, String);
  check(
    i8n_message,
    Match.Where(() => DefinedClientMessagesMap[i8n_message] !== undefined)
  ); // It has to be a known and supported message to the client
  check(
    parameter_array,
    Match.Where(() => {
      if (
        !DefinedClientMessagesMap[i8n_message].parameters ||
        DefinedClientMessagesMap[i8n_message].parameters.length === 0
      ) {
        if (
          parameter_array === undefined ||
          parameter_array == null ||
          (Array.isArray(parameter_array) && parameter_array.length() === 0)
        )
          return true;
        throw new Match.Error(
          "Message " + i8n_message + " is not allowed to have any parameters"
        );
      }
      if (!Array.isArray(parameter_array))
        throw new Match.Error("parameter_array must be an array");
      if (
        parameter_array.length() !==
        DefinedClientMessagesMap[i8n_message].parameters.length
      )
        throw new Match.Error(
          "parameter_array does not have the correct number of parameters. It should have " +
            DefinedClientMessagesMap[i8n_message].parameters.length +
            " parameters"
        );
    })
  );

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

Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) {
    ClientMessages.collection = ClientMessagesCollection;
  }
});
