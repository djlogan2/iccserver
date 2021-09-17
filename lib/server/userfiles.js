import { Meteor } from "meteor/meteor";
import { Picker } from "meteor/meteorhacks:picker";
import { FilesCollection } from "meteor/ostrio:files";
import { Logger } from "./Logger";
import AWS from "aws-sdk";
import fs from "fs";
import { SystemConfiguration } from "../../imports/collections/SystemConfiguration";

const logger = new Logger("server/userfiles_js");
const s3bucket = process.env.PUBLICASSETS_S3_BUCKET;

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

// argh
const s3 = new AWS.S3();

const unlink = Meteor.bindEnvironment((self, id, version) => {
  logger.debug("unlink id=" + id);
  self.unlink(self.collection.findOne(id), version);
});

const update = Meteor.bindEnvironment((self, id, userId) => {
  logger.debug("update id=" + id);
  const upd = { $set: {} };
  upd.$set["meta.private"] = userId;
  self.collection.update({ _id: id }, upd, (err) => {
    if (err) logger.error("error updating record: ", err);
  });
});

const error = Meteor.bindEnvironment(() => logger.error.apply(arguments));
const debug = Meteor.bindEnvironment(() => logger.debug.apply(arguments));

const ThemeAssets = new Mongo.Collection("themeassets");
//
// {
//    assetname: "x"         // "darksquare", "playicon", "headerfont", etc.
//    userid: "x",           // If this exists, it's private to this user
//    isolation_group: "x",  // If this exists, it's private to this isolation_group
//    theme: "x",            // Name of the theme
//    file: "x"              // file id
// }

export const PublicAsset = new FilesCollection({
  collectionName: "PublicAssets",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    logger.debug("onBeforeUpload", file);
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760) {
      return true;
    }
    return "Please upload file, with size equal or less than 10MB";
  },
  onAfterUpload(fileRef) {
    //const user = Meteor.user();
    logger.debug("onAfterUpload", fileRef);
    const self = this;
    //const vers = Array.isArray(fileRef.versions) ? fileRef.versions : [fileRef.versions];
    Object.keys(fileRef.versions).forEach((version) => {
      const vRef = fileRef.versions[version];
      const fileStream = fs.createReadStream(vRef.path);
      fileStream.on("error", (error) => {
        error("Error reading filestream", error);
      });
      s3.upload(
        {
          Bucket: s3bucket,
          ACL: "public-read",
          ContentEncoding: "x",
          ContentLength: vRef.size,
          ContentType: vRef.type,
          StorageClass: "STANDARD",
          Key: fileRef._id + "." + version,
          Body: fileStream,
        },
        (err, data) => {
          if (err) {
            error("Error uploading file to s3", err);
          } else {
            debug("Asset " + data.Location + " uploaded to s3");
          }
          if (version === "original") update(self, fileRef._id, fileRef.userId);
          unlink(self, fileRef._id, version);
        }
      );
    });
  },
  interceptDownload(http, fileRef, version) {
    logger.debug("interceptDownload", fileRef);
    http.response.writeHead(301, {
      Location: "https://" + s3bucket + ".s3.amazonaws.com/" + fileRef._id + "." + version,
    });
    http.response.end();
    return true;
  },
});

Meteor.publish("publicassets", function () {
  return PublicAsset.find().cursor;
});

Picker.route("/asset/:userid/:assetname", (params, req, res) => {
  const user = Meteor.users.findOne({ _id: params.userid }) || { _id: null, settings: {} };
  const default_theme = SystemConfiguration.defaultTheme();
  let asset;

  const finds = [
    {
      assetname: params.assetname,
      user: user._id,
      isolation_group: user.isolation_group,
      theme: user.settings.theme,
    },
    {
      assetname: params.assetname,
      user: user._id,
      isolation_group: user.isolation_group,
      theme: default_theme,
    },

    {
      assetname: params.assetname,
      user: user._id,
      isolation_group: { $exists: false },
      theme: user.settings.theme,
    },
    {
      assetname: params.assetname,
      user: user._id,
      isolation_group: { $exists: false },
      theme: default_theme,
    },

    {
      assetname: params.assetname,
      user: { $exists: false },
      isolation_group: user.isolation_group,
      theme: user.settings.theme,
    },
    {
      assetname: params.assetname,
      user: { $exists: false },
      isolation_group: user.isolation_group,
      theme: default_theme,
    },

    {
      assetname: params.assetname,
      user: { $exists: false },
      isolation_group: { $exists: false },
      theme: user.settings.theme,
    },
    {
      assetname: params.assetname,
      user: { $exists: false },
      isolation_group: { $exists: false },
      theme: default_theme,
    },
  ];

  for (let idx = 0; !asset && idx < finds.length; idx++) asset = ThemeAssets.findOne(finds[idx]);

  const file = !asset ? null : PublicAsset.findOne({ _id: asset.file });

  if (!file) {
    res.status(404).send("File " + params.which + " was not found");
    return;
  }
  res.writeHead(301, {
    Location: "https://" + s3bucket + ".s3.amazonaws.com/" + file._id + "." + "original",
  });
  res.end();
});
