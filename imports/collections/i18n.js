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

i18n.localizeMessage = function(locale, i8nvalue, parameters) {
  const i8nrecord = i18nCollection.findOne({
    messagid: i8nvalue,
    type: "server"
  });

  if (!i8nrecord) {
    throw new Meteor.Error(
      "Unable to find an internationalization record of type server with identifier " +
        i8nvalue
    );
  }

  if (!locale || !i8nrecord.text || !i8nrecord.text[locale]) locale = "en_us";

  if (!i8nrecord.text[locale])
    throw new Meteor.Error(
      "Unable to find an internationalization record of type server with a suitable locale for identifier " +
        i8nvalue
    );

  let a = i8nrecord.text[locale];

  for (let k in parameters) {
    a = a.replace("{" + k + "}", parameters[k]);
  }
  return a;
};

Meteor.startup(function(){
  if (Meteor.isTest || Meteor.isAppTest)
    i18n.collection = i18nCollection;
});
