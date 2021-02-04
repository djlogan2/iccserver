import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Users } from "../imports/collections/users";

const clientCollection = new Mongo.Collection("client_collection");

Meteor.publish(null, function() {
  if (!Meteor.userId()) return this.ready();
  return clientCollection.find({ userid: Meteor.userId() });
});

Users.addLogoutHook(userId => {
  clientCollection.remove({ userid: userId });
});

Meteor.methods({
  client_collection: data => {
    check(data, Object);
    if (!Meteor.userId())
      throw new Meteor.Error("Unable to update client collection -- user not logged in");
    clientCollection.upsert({ userid: Meteor.userId() }, { $set: data });
  }
});
