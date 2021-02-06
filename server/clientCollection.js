import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { UserStatus } from "meteor/mizzao:user-status";

const clientCollection = new Mongo.Collection("client_collection");

Meteor.publish(null, function() {
  if (!Meteor.userId()) return this.ready();
  return clientCollection.find({ userid: Meteor.userId() });
});

UserStatus.events.on("connectionLogout", function(fields) {
  clientCollection.remove({ userid: fields.userId });
});

Meteor.methods({
  client_collection: data => {
    check(data, Object);
    if (!Meteor.userId())
      throw new Meteor.Error("Unable to update client collection -- user not logged in");
    clientCollection.upsert({ userid: Meteor.userId() }, { $set: data });
  }
});
