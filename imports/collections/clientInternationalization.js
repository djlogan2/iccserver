import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

const mongoClientInternationalization = new Mongo.Collection("client_internationalization");

Meteor.publish("clientInternationalization", function (locale) {
  check(locale, Match.OneOf(String, null));

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
