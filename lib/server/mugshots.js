import { Meteor } from "meteor/meteor";
import { Users } from "../../imports/collections/users";
import { Picker } from "meteor/meteorhacks:picker";
import { Logger } from "./Logger";
import { s3FileCollection } from "./s3FileCollection";
import { SystemConfiguration } from "../../imports/collections/SystemConfiguration";
import ClientMessages from "../../imports/collections/ClientMessages";

const logger = new Logger("server/mugshots_js");
const s3bucket = process.env.MUGSHOTS_S3_BUCKET;

function updateVersionMetadata(fileRef, version) {
  const user = Meteor.users.findOne(fileRef.userId);
  const validated =
    Users.isAuthorized(user, "validate_mugshots") || SystemConfiguration.globalValidateMugshots();
  return { $set: { validated: validated } };
}

export const Mugshots = new s3FileCollection({
  s3bucket: s3bucket,
  collectionName: "Mugshots",
  publiclyAccessible: true,
  authorizedToUpload: () => Users.isAuthorized(Meteor.user(), "upload_mugshot"),
  updateVersionMetaData: (fileRef, version) => updateVersionMetadata(fileRef, version),
  authorizedToDelete: (fileRef) =>
    Users.isAuthorized(
      Meteor.user(),
      Meteor.userId() === fileRef.userId ? "delete_mugshot" : "delete_any_mugshot"
    ),
});

// Not sure we would really ever want to do this... Maybe for mugshot validators? Publish unvalidated files?
// Meteor.publish("mugshots", function () {
//   return Mugshots.find().cursor;
// });

Picker.route("/mugshot/:userid", (params, req, res) => {
  let file = Mugshots.findOne({ userId: params.userid }, { sort: { "meta.uploadTime": -1 } });
  if (!file) {
    const defaultMugshot = SystemConfiguration.defaultMugshot();
    if (!defaultMugshot) {
      res.status(404).send("Mugshot not found for " + params.userid);
      return;
    } else {
      res.writeHead(301, {
        Location: defaultMugshot,
      });
      res.end();
    }
  } else {
    res.writeHead(301, {
      Location: "https://" + s3bucket + ".s3.amazonaws.com/" + file._id + "." + "original",
    });
    res.end();
  }
});

Mugshots.approveMugshot = function (message_identifier, mugshot_id, version) {
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

  const mugshot = Mugshots.findOne({ _id: mugshot_id });
  if (!mugshot || !!mugshot.versions[version]) {
    ClientMessages.sendMessageToClient(self, message_identifier, "FILE_DOES_NOT_EXIST");
    return;
  }
  if (mugshot.versions[version].meta.validated) {
    ClientMessages.sendMessageToClient(self, message_identifier, "MUGSHOT_ALREADY_VALIDATED");
    return;
  }
  const setobject = { $set: {} };
  setobject.$set["versions." + version + ".meta.validated"] = true;
  this.filesCollection.update({ _id: mugshot_id }, setobject);
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
