import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

// TODO: DJL - Hmmmm, I did not know about this. What is this? Does this house the one and only
//       language record? If so, why in the world are you creating one gigantic json object?
//       Why not have each translation its own record like I do in i18n? It seems to me like
//       it's going to be extremely difficult for some dude translating application strings to
//       work with this...
//       I also don't like the thousand migration scripts that do exactly the same thing.
//       If you use them at all, they should just insert, or update/$set, the appropriate information
//       Alternatively, if you really are doing to do this week by week, wouldn't it be better to just
//       have a Meteor.startup() script somewhere that checks the version and inserts/updates if it differs
//       from what's in the database? Or even just outright upload/replace on every server restart?
//       So long as the theme is a single theme, like "development" or something, then even if ICC creates
//       new themes later, a replacement like this should not affect future themes.
const mongoClientInternationalization = new Mongo.Collection("client_internationalization");

Meteor.publish("clientInternationalization", function (locale) {
  check(locale, Match.Maybe(String));

  const options = {
    locale: null,
  };

  const acceptLanguage = locale.split(/[,;]/)[0].toLocaleLowerCase().replace("_", "-");

  if (!this.userId) {
    options.locale = acceptLanguage;
  } else {
    const userIntance = Meteor.users.findOne({ _id: this.userId });
    options.locale = userIntance.locale;
  }

  const localeInstance = mongoClientInternationalization.findOne(options);

  if (localeInstance) {
    return mongoClientInternationalization.find(options);
  }

  return mongoClientInternationalization.find({ locale: "en-us" });
});

export default mongoClientInternationalization;
