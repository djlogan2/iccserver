import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { i18n } from "./i18n";
import { Users } from "./users";

import { Logger } from "../../lib/server/Logger";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";

// eslint-disable-next-line no-unused-vars
let log = new Logger("ClientMessages_js");
const ClientMessagesCollection = new Mongo.Collection("client_messages");
const ClientMessageSchema = {
  createDate: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  to: String,
  client_identifier: String,
  message: String
};
ClientMessagesCollection.attachSchema(ClientMessageSchema);

//
// You can put whatever you want in the array for the parameters. It's for documentation only at the time of this writing.
// The code checks for the parameter COUNT, but does not otherwise verify.
//
export const DefinedClientMessagesMap = {
  UNABLE_TO_PLAY_RATED_GAMES: {},
  UNABLE_TO_PLAY_UNRATED_GAMES: {},
  LEGACY_MATCH_REMOVED: { parameters: ["legacy_explanation_string"] },
  CANNOT_MATCH_LOGGED_OFF_USER: {},
  NO_MATCH_FOUND: {},
  ILLEGAL_MOVE: { parameters: ["move"] },
  COMMAND_INVALID_NOT_YOUR_MOVE: {},
  NOT_AN_OBSERVER: {},
  ALREADY_AN_EXAMINER: {},
  NOT_AN_EXAMINER: {},
  NOT_PLAYING_A_GAME: {},
  UNABLE_TO_PLAY_OPPONENT: {},
  SERVER_ERROR: { parameters: ["message", "reason"] },
  TAKEBACK_ALREADY_PENDING: {},
  NO_TAKEBACK_PENDING: {},
  TAKEBACK_ACCEPTED: {},
  TAKEBACK_DECLINED: {},
  MATCH_DECLINED: {},
  DRAW_ACCEPTED: {},
  DRAW_DECLINED: {},
  DRAW_ALREADY_PENDING: {},
  ABORT_ACCEPTED: {},
  ABORT_DECLINED: {},
  ABORT_ALREADY_PENDING: {},
  ADJOURN_ACCEPTED: {},
  ADJOURN_DECLINED: {},
  ADJOURN_ALREADY_PENDING: {},
  BEGINNING_OF_GAME: {},
  END_OF_GAME: {},
  VARIATION_REQUIRED: {},
  INVALID_VARIATION: {},
  ALREADY_PLAYING: {},
  INVALID_SQUARE: { parameters: ["square"] },
  INVALID_ARROW: { parameters: ["from", "to"] },
  LOGIN_FAILED_1: {},
  LOGIN_FAILED_2: {},
  LOGIN_FAILED_3: {},
  LOGIN_FAILED_4: {},
  LOGIN_FAILED_5: {},
  LOGIN_FAILED_6: {},
  LOGIN_FAILED_7: {},
  LOGIN_FAILED_8: {},
  LOGIN_FAILED_9: {},
  LOGIN_FAILED_10: {},
  LOGIN_FAILED_11: {},
  LOGIN_FAILED_12: {},
  LOGIN_FAILED_13: {},
  LOGIN_FAILED_14: {},
  LOGIN_FAILED_15: {},
  LOGIN_FAILED_16: {},
  LOGIN_FAILED_17: {},
  LOGIN_FAILED_18: {},
  LOGIN_FAILED_19: {},
  LOGIN_FAILED_20: {},
  LOGIN_FAILED_21: {},
  LOGIN_FAILED_22: {},
  FOR_TESTING: {},
  FOR_TESTING_10: { parameters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] }
};

Meteor.publish("client_messages", function() {
  return ClientMessagesCollection.find({ to: this.userId });
});

Meteor.methods({
  "acknowledge.client.message": function(id) {
    check(id, String);
    const rec = ClientMessagesCollection.findOne({ _id: id });
    if (!rec)
      throw new ICCMeteorError("server", "We should not be deleting a nonexistant client message");
    if (rec.to !== this.userId)
      throw new ICCMeteorError(
        "server",
        "We should not be deleting a client message that does not belong to us"
      );
    ClientMessagesCollection.remove({ _id: id });
  }
});

export const ClientMessages = {};

ClientMessages.sendMessageToClient = function(user, client_identifier, i18n_message) {
  check(user, Match.OneOf(Object, String));
  check(client_identifier, String);
  check(
    i18n_message,
    Match.Where(() => {
      if (DefinedClientMessagesMap[i18n_message] === undefined)
        throw new Match.Error(i18n_message + " is not known to ClientMessages");
      else return true;
    })
  ); // It has to be a known and supported message to the client
  const parms = [];
  for (let x = 3; x < arguments.length; x++)
    if (Array.isArray(arguments[x])) arguments[x].forEach(arg => parms.push(arg));
    else parms.push(arguments[x]);
  const required_parms = !DefinedClientMessagesMap[i18n_message].parameters
    ? 0
    : DefinedClientMessagesMap[i18n_message].parameters.length;

  if (required_parms !== parms.length)
    throw new Match.Error(
      i18n_message +
        " is required to have " +
        required_parms +
        " parameters, but only had " +
        parms.length +
        " parameters"
    );
  const id = typeof user === "object" ? user._id : user;
  const touser = Meteor.users.findOne({ _id: id, "status.online": true });
  if (!touser) return;
  // Actually, let's go ahead and i18n convert this puppy here, and just save the message itself!
  const locale = touser.locale || "en-us";

  const message = i18n.localizeMessage(locale, i18n_message, parms);

  return ClientMessagesCollection.insert({
    to: id,
    client_identifier: client_identifier,
    message: message
  });
};

function logoutHook(userId) {
  ClientMessagesCollection.remove({ to: userId });
}

Meteor.startup(function() {
  //DOUBT: I am not sure that I have create an index on createDate for automatically discard a document in 1 minute.
  // if it is not required then I will remove later.
  ClientMessagesCollection.rawCollection().createIndex(
    { createDate: 1 },
    { expireAfterSeconds: 60 }
  );
  Users.addLogoutHook(logoutHook);

  if (Meteor.isTest || Meteor.isAppTest) {
    ClientMessages.collection = ClientMessagesCollection;
    ClientMessages.logoutHook = logoutHook;
  }
});
