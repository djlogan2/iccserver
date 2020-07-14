import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Users } from "../imports/collections/users";
import { FS } from "meteor/cfs:base-package";
import { Logger } from "../lib/server/Logger";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

let log = new Logger("server/Mugshots_js");

export const Mugshots = {};

Mugshots.delete = function(message_indentifier, user) {
  check(message_indentifier, String);
  check(user, Object);

  const self = Meteor.user();
  check(self, Object);

  if (self._id === user._id) {
    if (!Users.isAuthorized(self, ["delete_mugshot", "delete_any_mugshot"])) throw new ICCMeteorError(message_indentifier, "Unable to delete mugshot", "Not authorized");
  } else {
    if (!Users.isAuthorized(self, "delete_any_mugshot")) throw new ICCMeteorError(message_indentifier, "Unable to delete mugshot", "Not authorized");
  }

  if (!user.mugshot) return; // No mugshot to delete, just blow out of here
  Meteor.users.update({ _id: user._id }, { $unset: { mugshot: 1 } });
  MugshotCollection.remove({ _id: user.mugshot._id });
};

Mugshots.validate = function(message_identifier, fileobj_id) {
  check(message_identifier, String);
  check(fileobj_id, String);

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "validate_mugshots")) throw new ICCMeteorError(message_identifier, "Unable to validate mugshot", "Not authorized");

  const fileObj = MugshotCollection.findOne({ _id: fileobj_id });
  //check(fileObj, Object);
  if (!fileObj) throw new ICCMeteorError(message_identifier, "Unable to validate mugshot", "Unable to find mugshot record");

  const user = Meteor.users.findOne({ _id: fileObj.creatorId });
  check(user, Object);

  MugshotCollection.remove({
    $and: [{ _id: { $ne: fileobj_id } }, { creatorId: fileObj.creatorId }, { validated: true }]
  });

  MugshotCollection.update({ _id: fileobj_id }, { $set: { validated: true, username: user.username } });

  delete fileObj.creatorId;
  delete fileObj.validated;

  Meteor.users.update({ _id: user._id }, { $set: { mugshot: fileObj } });
  log.debug("user " + self.username + " validated mugshot for " + user.username + ", fileObj=" + fileObj._id);
};

const MugshotCollection = new FS.Collection("mugshots", {
  stores: [
    new FS.Store.FileSystem("mugshots", {
      path: "uploads/mugshots",
      beforeWrite(fileObj) {
        log.debug("Deleting old unvalidated mugshots for user " + fileObj.creatorId);
        MugshotCollection.remove({
          $and: [{ _id: { $ne: fileObj._id } }, { creatorId: fileObj.creatorId }, { validated: false }]
        });
      }
    })
  ]
});

MugshotCollection.allow({
  insert: function(userId, doc) {
    if (!userId) {
      log.debug("MugshotCollection::allow::insert - no userId");
      return false;
    }
    log.debug("User " + userId + " trying to upload a mugshot");
    if (!doc || !doc.creatorId || doc.creatorId !== userId || doc.validated !== false) {
      console.log(doc);
      log.debug("MugshotCollection::allow::insert - no missing creatorId or userId mismatch or missing validated: false");
      return false;
    }
    const user = Meteor.users.findOne({ _id: userId });
    return !!user && Users.isAuthorized(user, "upload_mugshot");
  },
  update: function(userId, doc) {
    if (!userId) {
      return false;
    }
    if (!doc || !doc.creatorId || doc.creatorId !== userId) return false;
    const user = Meteor.users.findOne({ _id: userId });
    return !!user && Users.isAuthorized(user, "upload_mugshot");
  },
  download: function(userId, doc) {
    return false; //doc.creatorId == userId;
  }
});

Meteor.methods({
  validatemugshot: Mugshots.validate
});
