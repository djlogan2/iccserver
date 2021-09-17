import { Meteor } from "meteor/meteor";
import { Picker } from "meteor/meteorhacks:picker";
import { FilesCollection } from "meteor/ostrio:files";
import { Logger } from "./Logger";
import AWS from "aws-sdk";
import fs from "fs";

const logger = new Logger("server/userfiles_js");

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

export const Images = new FilesCollection({
  collectionName: "Images",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    logger.debug("onBeforeUpload", file);
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return "Please upload image, with size equal or less than 10MB";
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
          Bucket: "chessclub-com-v2-staging",
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
            error("Error uploading image to s3", err);
          } else {
            debug("Image " + data.Location + " uploaded to s3");
          }
          if (version === "original") update(self, fileRef._id, fileRef.userId);
          unlink(self, fileRef._id, version);
        }
      );
    });
  },
  //https://chessclub-com-v2-staging.s3.amazonaws.com/oKv6pdntkDR6R3KAp.original
  interceptDownload(http, fileRef, version) {
    logger.debug("interceptDownload", fileRef);
    http.response.writeHead(301, {
      Location:
        "https://" +
        "chessclub-com-v2-staging" +
        ".s3.amazonaws.com/" +
        fileRef._id +
        "." +
        version,
    });
    http.response.end();
    return true;
    //http.redirect();
    /*    const params = {
          Bucket: "chessclub-com-v2-staging",
          Key: fileRef._id + "." + version,
        };

        if (!!http.request.headers.range) params.Range = http.request.headers.range;

        s3.getObject(params, function (err, data) {
          if (err) {
            console.log("error!", err);
            if (!http.response.finished) http.response.end();
          } else {
            Object.keys(headerConversions).forEach((header) => {
              const headervalue = data[headerConversions[header]];
              if (!!headervalue) http.response.setHeader(header, headervalue);
            });
            // http.response.setHeader("Cache-Control", data.CacheControl);
            // http.response.setHeader("Expires", data.Expires);
            // http.response.setHeader("Content-Disposition", data.ContentDisposition);
            // http.response.setHeader("Content-Length", data.ContentLength);
            // http.response.setHeader("Content-Type", data.ContentType);
            // http.response.setHeader("Content-Language", data.ContentLanguage);
            // http.response.setHeader("Accept-Ranges", data.AcceptRanges);
            // http.response.setHeader("Content-Range", data.ContentRange);
          }
        });
    return true;
     */
  },
});
//data.Body;

//data.ContentEncoding

/*
data = {
AcceptRanges: "bytes",
ContentLength: 10,
ContentRange: "bytes 0-9/43",
ContentType: "text/plain",
ETag: "\"0d94420ffd0bc68cd3d152506b97a9cc\"",
LastModified: <Date Representation>,
Metadata: {
},
VersionId: "null"
}
*/

Meteor.publish("files.images.all", function () {
  return Images.find().cursor;
});

Picker.route("/image/:userid/:which", (params, req, res) => {
  const user = Meteor.users.findOne({ _id: params.userid });
  // if (!user) {
  //   res.status(404).send("No user logged on");
  //   return;
  // }

  // User-specific?
  // Some "configuration setting"
  // default

  // Personal image, viewable only to the user
  let file;

  if (!!user) {
    file = Images.findOne({
      "meta.which": params.which,
      private: user._id,
      isolation_group: user.isolation_group,
    });
    // isolation_group specific with from a user-specified configuration
    if (!file)
      file = Images.findOne({
        "meta.which": params.which,
        "meta.config": user.settings.config,
        "meta.isolation_group": user.isolation_group,
      });
    // isolation_group specific default
    if (!file)
      file = Images.findOne({
        "meta.which": params.which,
        "meta.config": "default",
        isolation_group: user.isolation_group,
      });
    // global user-specified config
    if (!file)
      file = Images.findOne({
        "meta.which": params.which,
        "meta.config": user.settings.config,
        "meta.isolation_group": { $exists: false },
      });
  }
  // global default
  if (!file)
    file = Images.findOne({
      "meta.which": params.which,
      "meta.config": "default",
      "meta.isolation_group": { $exists: false },
    });
  // give up -- no file!
  if (!file) {
    res.status(404).send("File " + params.which + " was not found");
    return;
  }
  res.writeHead(301, {
    Location:
      "https://" + "chessclub-com-v2-staging" + ".s3.amazonaws.com/" + file._id + "." + "original",
  });
  res.end();
});
