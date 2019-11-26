import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const i18n = {};
const i18nCollection = new Mongo.Collection("i18n");
//
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

i18n.standardizeLocale = function(locale) {
  // We need an array of all of the possible locales.
  // This includes, in order:
  // (1) The original locale, such as, say "fr-sp"
  // (2) Just the language part if there is a qualifier, like "fr" from above
  // (3) "en-us" if the original locale isn't english
  // (4) "en" per the same logic as #2
  let lower = null;
  const all = [];
  if (!!locale) {
    lower = locale.toLowerCase().replace("_", "-");
    all.push(lower);
    const idx = lower.indexOf("-");
    if (idx !== -1) {
      all.push(lower.substr(0, idx));
    }
  }
  //DOUBT: In our message collection we have 3 language: en_us,es,ru, and you have entered in database and
  //here below the wrong string of language so I'm passing here the correct code for language to get the message
  if (lower === "en" || lower === "en-us") {
    all.push("en_us");
    return all;
  }
  all.push("en-us");
  all.push("en");
  return all;
};

i18n.localizeMessage = function(locale, i8nvalue, parameters) {
  const i8nrecord = i18nCollection.findOne({
    messageid: i8nvalue,
    type: "server"
  });

  if (!i8nrecord) {
    throw new Meteor.Error(
      "Unable to find an internationalization record of type server with identifier " +
        i8nvalue
    );
  }
  const locale_array = i18n.standardizeLocale(locale);
  let a;
  locale_array.forEach(ll => {
    if (i8nrecord.text[ll]) {
      a = i8nrecord.text[ll];
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
      i8nvalue
  );
};

Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) i18n.collection = i18nCollection;
});
