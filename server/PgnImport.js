import { _ } from "meteor/underscore";
import { FilesCollection } from "meteor/ostrio:files";
import { Parser } from "./pgn/pgnparser";
import fs from "fs";
import { ImportedGameCollection } from "./Game";
import { Logger } from "../lib/server/Logger";
const log = new Logger("server/PgnImport_js");

const insert = Meteor.bindEnvironment(document => ImportedGameCollection.insert(document));

Meteor.publish("imported_games", function() {
  return ImportedGameCollection.find(
    { creatorId: Meteor.userId() },
    { fields: { creatorId: 1, fileRef: 1, white: 1, black: 1, result: 1 } }
  );
});

const process = (fileRef, vRef, version, testCallback) => {
  Meteor.defer(() => {
    const fss = fs.createReadStream(vRef.path);
    const parser = new Parser();
    let saveBuffer;
    fss
      .on("readable", () => {
        //debug("on.readable");
        let _chunk;
        let gamelist;
        while (null !== (_chunk = fss.read())) {
          //debug("on.readable.read");
          let chunk;

          if (!!saveBuffer && saveBuffer.length)
            chunk = Buffer.concat([saveBuffer, Buffer.from(_chunk)]);
          else chunk = Buffer.from(_chunk);
          let end = chunk.lastIndexOf("\n");
          if (end === -1) end = chunk.lastIndexOf(" ");

          if (end === -1) {
            saveBuffer = chunk;
          } else {
            end++;
            // if (chunk.length > 32)
            //   debug(chunk.toString("utf8", 0, 16) + " ... " + chunk.toString("utf8", end - 16));
            // else debug(chunk.toString("utf8"));
            parser.feed(chunk.toString("utf8", 0, end));
          }
          saveBuffer = chunk.slice(end);
          if (!!parser.gamelist) {
            gamelist = parser.gamelist;
            delete parser.gamelist;
            gamelist.forEach(game => {
              game.creatorId = fileRef.userId;
              game.fileRef = fileRef._id;
              insert(game);
            });
          }
          //debug("on.readable.read.end");
        }
        //debug("on.readable end");
      })
      .on("end", () => {
        //debug("on.end");
        if (!!saveBuffer && saveBuffer.length) {
          // if (saveBuffer.length > 32)
          //   debug(
          //     saveBuffer.toString("utf8", 0, 16) +
          //       " ... " +
          //       saveBuffer.toString("utf8", saveBuffer.length - 16)
          //   );
          // else debug(saveBuffer.toString("utf8"));
          parser.feed(saveBuffer.toString("utf8"));
          if (!!parser.gameobject) parser.gamelist.push(parser.gameobject);
          if (!!parser.gamelist)
            parser.gamelist.forEach(game => {
              game.creatorId = fileRef.userId;
              game.fileRef = fileRef._id;
              insert(game);
            });
        }
        ImportedPgnFiles._unlink(fileRef._id, version);
        if (!!testCallback && typeof testCallback === "function") testCallback();
        //debug("end on.end");
      });
  });
};

// Declare the Meteor file collection on the Server
export const ImportedPgnFiles = new FilesCollection({
  debug: true, // Change to `true` for debugging
  storagePath: "assets/app/uploads/uploadedFiles",
  collectionName: "importedPgnFiles",
  // Disallow Client to execute remove, use the Meteor.method
  allowClientCode: false,

  // Start parsing pgn files
  // after fully received by the Meteor server
  onAfterUpload(fileRef, testCallback) {
    _.each(fileRef.versions, (vRef, version) => process(fileRef, vRef, version, testCallback));
  },

  // Intercept access to the file
  interceptDownload(http, fileRef, version) {
    return false;
  }
});

// Intercept FilesCollection's remove method to remove file
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

ImportedPgnFiles._unlink = Meteor.bindEnvironment((id, version) => {
  ImportedPgnFiles.unlink.call(ImportedPgnFiles, ImportedPgnFiles.collection.findOne(id), version);
});
