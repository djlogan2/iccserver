import { Meteor } from "meteor/meteor";
import { Users } from "../../imports/collections/users";
import { Logger } from "./Logger";
import { s3FileCollection } from "./s3FileCollection";
import { SystemConfiguration } from "../../imports/collections/SystemConfiguration";
import ClientMessages from "../../imports/collections/ClientMessages";

const logger = new Logger("server/mugshots_js");
const s3bucket = process.env.MUGSHOTS_S3_BUCKET;

function updateFileMetadata(fileRef) {
  const user = Meteor.users.findOne(fileRef.userId);
  const validated =
    Users.isAuthorized(user, "validate_mugshots") || SystemConfiguration.globalValidateMugshots();
  if (validated) {
    Mugshots.remove({ userId: fileRef.userId, "meta.validated": true });
    Meteor.users.update({ _id: fileRef.userId }, { $set: { mugshot: fileRef._id } });
  }
  return { validated: validated };
}

function onAfterDelete(fileRef) {
  const user = Meteor.users.findOne({ _id: fileRef.userId });
  if (user?.settings?.mugshot === fileRef._id) {
    Meteor.users.update({ _id: user._id }, { $unset: { mugshot: 1 } });
  }
}

export const Mugshots = new s3FileCollection({
  s3bucket: s3bucket,
  collectionName: "Mugshots",
  publiclyAccessible: true,
  authorizedToUpload: () => Users.isAuthorized(Meteor.user(), "upload_mugshot"),
  updateFileMetaData: (fileRef) => updateFileMetadata(fileRef),
  onAfterDelete: (fileRef) => onAfterDelete(fileRef),
  authorizedToDelete: (fileRef) =>
    Users.isAuthorized(
      Meteor.user(),
      Meteor.userId() === fileRef.userId ? "delete_mugshot" : "delete_any_mugshot"
    ),
});

Meteor.startup(() => {
  Mugshots.rawCollection().createIndex({ "meta.version": 1, userId: 1 }, { unique: 1 });
});

Meteor.publish("mugshots", function () {
  return Mugshots.find({ userId: Meteor.userId() }).cursor;
});

Mugshots.approveMugshot = function (message_identifier, mugshot_id) {
  check(message_identifier, String);
  check(mugshot_id, String);

  const self = Meteor.user();
  check(self, Object);

  if (
    !Users.isAuthorized(self, "validate_mugshots") &&
    !SystemConfiguration.globalValidateMugshots()
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  const mugshot = Mugshots.findOne({ _id: mugshot_id, "meta.validated": false });
  if (!mugshot) {
    ClientMessages.sendMessageToClient(self, message_identifier, "FILE_DOES_NOT_EXIST");
    return;
  }
  if (mugshot.meta.validated) {
    ClientMessages.sendMessageToClient(self, message_identifier, "MUGSHOT_ALREADY_VALIDATED");
    return;
  }
  const setobject = { $set: {} };
  setobject.$set["meta.validated"] = true;
  this.filesCollection.remove({ userId: mugshot.userId, "meta.valdated": true });
  this.filesCollection.update({ _id: mugshot_id }, { $set: { "meta.validated": true } });
  Meteor.users.update({ _id: mugshot.userId }, { $set: { mugshot: mugshot_id } });
};

// What do we do here? Message the user maybe?
// Mugshots.denyMugshot = function(message_identifier, mugshot_id) {
//
// };

Mugshots.deleteMugshot = function (message_identifier, mugshot_id) {};

Meteor.methods({
  approveMugshot: Mugshots.approveMugshot,
  //denyMugshot: Mugshots.denyMugshot,
  deleteMugshot: Mugshots.deleteMugshot,
});
