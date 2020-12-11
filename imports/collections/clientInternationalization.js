import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";

const mongoClientInternationalization = new Mongo.Collection("client_internationalization");

Meteor.publish("clientInternationalization", function(locale) {
  new SimpleSchema({
    locale: { type: String }
  }).validate({ locale });

  const options = {
    locale: { $in: ["en-US", "ru-RU"] }
  };

  const acceptLanguage = locale
    .split(/[,;]/)[0]
    .toLocaleLowerCase()
    .replace("_", "-");

  if (!this.userId) {
    options.locale.$in.push(acceptLanguage);

    return mongoClientInternationalization.find(options);
  } else {
    const userIntance = Meteor.users.findOne({ _id: this.userId });
    options.locale.$in.push(userIntance.locale);

    return mongoClientInternationalization.find(options);
  }
});

export default mongoClientInternationalization;
