import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { Logger } from "../../lib/server/Logger";

export const i18n = {};
export const i18nCollection = new Mongo.Collection("i18n");

const i18nSchema = new SimpleSchema({
  messageid: String,
  locale: String,
  text: String
});

i18nCollection.attachSchema(i18nSchema);

const log = new Logger("server/i18n_js");

// This one will have a schema something like this:
//
// {
//    _id: mongo_id,
//    type: server,                 <- Could be client, which would be sent to the client for use in web pages
//    messageid: some_message_id,   <- Obviously has to be unique. Well, unique to the client and unique to the server
//    text: {
//      en_us: "The message with value {1} as a parameter value",
//      es: "El mensaje con el valor {1} como valor de parámetro",
//      fr_xx: "Le message avec la valeur {1} en tant que valeur de paramètre"
//    }
// }
//
// update: type: server is no longer needed
// update: locale has become its own field since simple-schema cannot handle multiple layers of types

i18n.standardizeLocale = function(locale) {
  // We need an array of all of the possible locales.
  // This includes, in order:
  // (1) The original locale, such as, say "fr_sp"
  // (2) Just the language part if there is a qualifier, like "fr" from above
  // (3) "en_us" if the original locale isn't english
  // (4) "en" per the same logic as #2
  let lower = null;
  const all = [];

  if (!!locale) {
    lower = locale.toLowerCase().replace("-", "_");
    all.push(lower);
    const idx = lower.indexOf("_");
    if (idx !== -1) {
      all.push(lower.substr(0, idx));
    }
  }

  if (all.indexOf("en_us") === -1) all.push("en_us");
  if (all.indexOf("en") === -1) all.push("en");

  return all;
};

i18n.localizeMessage = function(locale, i18nvalue, parameters) {
  const i8nrecord = i18nCollection.findOne({
    messageid: i18nvalue
  });

  if (!i8nrecord) {
    throw new Meteor.Error(
      "Unable to find an internationalization record of type server with identifier " + i18nvalue
    );
  }
  const locale_array = i18n.standardizeLocale(locale);
  let a;
  locale_array.forEach(() => {
    if (i8nrecord.text) {
      a = i8nrecord.text;
      for (let k in parameters) {
        a = a.replace("{" + k + "}", parameters[k]);
      }
      // return a;
    }
  });
  if (a !== undefined) {
    return a;
  }
  throw new Meteor.Error(
    "Unable to find an internationalization record of type server with a suitable locale for identifier " +
      i18nvalue
  );
};

i18n.addIfNotExists = function(i18nvalue) {
  if (!!i18nCollection.find({ messageid: i18nvalue }).count()) return;
  i18nCollection.insert({
    messageid: i18nvalue,
    locale: "en",
    text: i18nvalue
  });
  log.error("I18N ADDING NON-EXISTANT MESSAGE IDENTIFIER: " + i18nvalue);
};

export default i18nCollection;
Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) i18n.collection = i18nCollection;
});
