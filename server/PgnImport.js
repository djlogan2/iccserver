import { Meteor } from "meteor/meteor";
import { FS } from "meteor/cfs:base-package";
import { Logger } from "../lib/server/Logger";
import { Users } from "../imports/collections/users";

import "./pgn/pgnimportfilesystem.server";

let log = new Logger("server/PgnImports_js");

const PgnImportsCollection = new FS.Collection("uploaded_pgns", {
  stores: [new FS.Store.PGNImportFileSystem("importedpgns")]
});

PgnImportsCollection.allow({
  insert: function(userId, doc) {
    if (!userId) {
      log.debug("PgnImportsCollection::allow::insert - no userId");
      return false;
    }
    log.debug("User " + userId + " trying to upload a pgn");
    if (!doc || !doc.creatorId || doc.creatorId !== userId) {
      log.debug("PgnImportsCollection::allow::insert - no missing creatorId or userId mismatch");
      return false;
    }
    const user = Meteor.users.findOne({ _id: userId });
    return !!user && Users.isAuthorized(user, "upload_pgn");
  },
  update: function(userId, doc) {
    return false;
  },
  download: function(userId, doc) {
    return false; //doc.creatorId == userId;
  }
});
