import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import { Logger } from "./Logger";
import AWS from "aws-sdk";
import fs from "fs";

const logger = new Logger("server/s3FileCollection_js");

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

// argh
const s3 = new AWS.S3();

export class s3FileCollection {
  constructor(config) {
    const self = this;
    this.s3bucket = config.s3bucket;
    this.filesCollection = new FilesCollection({
      collectionName: config.collectionName,
      allowedOrigins: /^https:\/\/.*\.chessclub.com:[0-9]*$/,
      allowClientCode: false,
      onBeforeUpload: Meteor.bindEnvironment((file) => this.onBeforeUpload(file)),
      onAfterUpload: Meteor.bindEnvironment((fileRef) => this.onAfterUpload(fileRef)),
      interceptDownload: Meteor.bindEnvironment((http, fileRef, version) =>
        this.interceptDownload(http, fileRef, version)
      ),
    });

    this._origRemove = this.filesCollection.remove;
    this.filesCollection.remove = (selector) => this.remove(selector);

    if (config.authorizedToUpload && config.authorizedToUpload === "function")
      this.authorizedToUpload = config.authorizedToUpload;
    else if (config.authorizedToUpload !== undefined)
      this.authorizedToUpload = () => !!config.authorizedToUpload;
    else this.authorizedToUpload = () => true;

    if (config.authorizedToDelete && config.authorizedToDelete === "function")
      this.authorizedToDelete = config.authorizedToDelete;
    else if (config.authorizedToDelete !== undefined)
      this.authorizedToDelete = () => !!config.authorizedToDelete;
    else this.authorizedToDelete = () => true;

    if (config.onAfterDelete && config.onAfterDelete === "function")
      this.onAfterDelete = config.onAfterDelete;

    if (config.updateFileMetaData && typeof config.updateFileMetaData === "function")
      this.updateFileMetaData = config.updateFileMetaData;

    this.publiclyAccessible = !!config.publiclyAccessible;
  }

  onBeforeUpload(file) {
    if (!this.authorizedToUpload) {
      return "Upload not available";
    }
    return true;
  }

  onAfterUpload(fileRef) {
    logger.debug("onAfterUpload", fileRef);
    const self = this;
    Object.keys(fileRef.versions).forEach((version) => {
      const vRef = fileRef.versions[version];
      const fileStream = fs.createReadStream(vRef.path);
      fileStream.on("error", (error) => {
        logger.error("Error reading filestream", error);
      });
      if (!!this.s3bucket) {
        s3.upload(
          {
            Bucket: this.s3bucket,
            ACL: this.publiclyAccessible ? "public-read" : "?",
            ContentEncoding: "x",
            ContentLength: vRef.size,
            ContentType: vRef.type,
            StorageClass: "STANDARD",
            Key: fileRef._id + "." + version,
            Body: fileStream,
          },
          Meteor.bindEnvironment((err, data) => {
            if (err) {
              logger.error("Error uploading file to s3", err);
            } else {
              logger.debug("File " + data.Location + " uploaded to s3");
            }
            const update = !!this.updateFileMetaData ? this.updateFileMetaData(fileRef) : null;
            if (!!update)
              this.filesCollection.update({ _id: fileRef._id }, { $set: { meta: update } });
            self.filesCollection.unlink(self.filesCollection.findOne(fileRef._id), version);
          })
        );
      } else {
        // No s3 bucket, so it's a local file
        const update = !!this.updateFileMetaData ? this.updateFileMetaData(fileRef) : null;
        if (!!update) this.filesCollection.update({ _id: fileRef._id }, { $set: { meta: update } });
      }
    });
  }

  remove(selector) {
    const cursor = this.filesCollection.collection.find(selector);
    cursor.forEach((fileRef) => {
      if (!this.authorizedToDelete(fileRef))
        throw new Meteor.Error(404, "Delete is currently unavailable");
      if (this.s3bucket) {
        Object.keys(fileRef.versions).forEach((version) => {
          const vRef = fileRef.versions[version];
          if (vRef) {
            s3.deleteObject(
              {
                Bucket: this.s3bucket,
                Key: fileRef._id + "." + version,
              },
              Meteor.bindEnvironment((error) => {
                if (error) {
                  logger.error(error);
                }
              })
            );
          }
        });
      }
      if (!!this.onAfterDelete) this.onAfterDelete(fileRef);
    });

    //remove original file from database
    this._origRemove.call(this.filesCollection, selector);
  }

  interceptDownload(http, fileRef, version) {
    if (!this.s3bucket) return false;
    logger.debug("interceptDownload", fileRef);
    http.response.writeHead(301, {
      Location: "https://" + this.s3bucket + ".s3.amazonaws.com/" + fileRef._id + "." + version,
    });
    http.response.end();
    return true;
  }

  findOne(selector) {
    return this.filesCollection.findOne(selector);
  }

  find(selector) {
    return this.filesCollection.find(selector);
  }
}
