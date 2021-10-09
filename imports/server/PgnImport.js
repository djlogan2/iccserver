import { _ } from "meteor/underscore";
import { FilesCollection } from "meteor/ostrio:files";
import fs from "fs";
import { ImportedGameCollection } from "./Game";
import { Logger } from "../../lib/server/Logger";
import importer from "@chessclub.com/chesspgn/app/importer";
const log = new Logger("server/PgnImport_js");

const insert = Meteor.bindEnvironment((document) => ImportedGameCollection.insert(document));

Meteor.publish("imported_games", function () {
  return ImportedGameCollection.find(
    { creatorId: Meteor.userId() },
    { fields: { creatorId: 1, fileRef: 1, white: 1, black: 1, result: 1 } }
  );
});

const pgnToGame = Meteor.bindEnvironment((tags, movelist, callback) => callback(Game.pgnToGame(tags, movelist)));
const process = (fileRef, vRef, version, testCallback) => {
  Meteor.defer(() => {
    const fss = fs.createReadStream(vRef.path);
    const pgnimporter = new importer();
    pgnimporter.import(fss)
      .events.on("gamesready", (gamelist) => {
      gamelist.forEach((importedgame) => {
        pgnToGame(importedgame.tags, importedgame.movelist, (game) => {
          game.creatorId = fileRef.userId;
          game.fileRef = fileRef._id;
          insert(game);
        });
      });
    });
    ImportedPgnFiles._unlink(fileRef._id, version);
    if (!!testCallback && typeof testCallback === "function") testCallback();
    //debug("end on.end");
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
  },
});

// Intercept FilesCollection's remove method to remove file
const _origRemove = ImportedPgnFiles.remove;
ImportedPgnFiles.remove = function (search) {
  const cursor = this.collection.find(search);
  cursor.forEach((fileRef) => {
    _.each(fileRef.versions, (vRef) => {
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
