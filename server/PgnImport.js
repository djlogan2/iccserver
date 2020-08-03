import { _ } from "meteor/underscore";
import { FilesCollection } from "meteor/ostrio:files";
import { Parser } from "./pgn/pgnparser";
import fs from "fs";
import { Mongo } from "meteor/mongo";

export const ImportedGameCollection = new Mongo.Collection("imported_games");

const insert = Meteor.bindEnvironment((document) => ImportedGameCollection.insert(document));

// Declare the Meteor file collection on the Server
const ImportedPgnFiles = new FilesCollection({
  debug: true, // Change to `true` for debugging
  storagePath: "assets/app/uploads/uploadedFiles",
  collectionName: "importedPgnFiles",
  // Disallow Client to execute remove, use the Meteor.method
  allowClientCode: false,

  // Start parsing pgn files
  // after fully received by the Meteor server
  onAfterUpload(fileRef) {
    // Run through each of the uploaded file
    // argh!
    _.each(fileRef.versions, (vRef, version) => {
      // We use Random.id() instead of real file's _id
      // to secure files from reverse engineering on the AWS client
      //const filePath = "files/" + Random.id() + "-" + version + "." + fileRef.extension;
      const fss = fs.createReadStream(vRef.path);
      const parser = new Parser();
      console.log("process the file here");
      fss
        .on("readable", () => {
          let _chunk;
          let saveBuffer;
          let gamelist;
          while (null !== (_chunk = fss.read())) {
            console.log("---data---");
            console.log(_chunk);
            //--
            let chunk;

            if (!!saveBuffer && saveBuffer.length)
              chunk = Buffer.concat([saveBuffer, Buffer.from(_chunk)]);
            else chunk = Buffer.from(_chunk);
            let end = chunk.lastIndexOf("\n");

            if (end === -1) {
              saveBuffer = chunk;
            } else {
              end++;
              parser.feed(chunk.toString("utf8", 0, end));
            }
            saveBuffer = chunk.slice(end);
            if (!!parser.gamelist) {
              gamelist = parser.gamelist;
              delete parser.gamelist;
              gamelist.forEach(game => {
                game.creatorId = fileRef.meta.creatorId;
                insert(game);
              });
            }
            //--
          }
          if (!!saveBuffer && saveBuffer.length) {
            parser.feed(saveBuffer.toString("utf8"));
            if (!!parser.gamelist) {
              gamelist = parser.gamelist;
            } else gamelist = [];
            if (!!parser.gameobject) gamelist.push(parser.gameobject);
            if (!!gamelist)
              gamelist.forEach(game => {
                game.creatorId = fileRef.meta.creatorId;
                insert(game);
              });
          }
        })
        .on("end", () => {
          console.log("---We are done---");
        });
    });
  },

  // Intercept access to the file
  // And redirect request to AWS:S3
  interceptDownload(http, fileRef, version) {
    return false;
  }
});

// Intercept FilesCollection's remove method to remove file from AWS:S3
const _origRemove = ImportedPgnFiles.remove;
ImportedPgnFiles.remove = function(search) {
  const cursor = this.collection.find(search);
  cursor.forEach(fileRef => {
    _.each(fileRef.versions, vRef => {
      if (vRef && vRef.meta && vRef.meta.pipePath) {
        console.log("Delete the file here");
      }
    });
  });

  //remove original file from database
  _origRemove.call(this, search);
};
