import { Meteor } from "meteor/meteor";
import { Picker } from "meteor/meteorhacks:picker";
import { Users } from "../../imports/collections/users";
import { s3FileCollection } from "./s3FileCollection";
import { Logger } from "./Logger";
import { SystemConfiguration } from "../../imports/collections/SystemConfiguration";

const logger = new Logger("server/userfiles_js");
const s3bucket = process.env.PUBLICASSETS_S3_BUCKET;

const ThemeAssets = new Mongo.Collection("themeassets");
export const PublicAsset = new s3FileCollection({
  s3bucket: s3bucket,
  collectionName: "PublicAssets",
  publiclyAccessible: true,
  authorizedToUpload: () => Users.isAuthorized(Meteor.user(), "upload_asset"),
  authorizedToDelete: () => Users.isAuthorized(Meteor.user(), "delete_asset"),
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
    res.writeHead(404);
    res.end("File " + params.which + " was not found");
    return;
  }
  res.writeHead(301, {
    Location: "https://" + s3bucket + ".s3.amazonaws.com/" + file._id + ".original",
  });
  res.end();
});
