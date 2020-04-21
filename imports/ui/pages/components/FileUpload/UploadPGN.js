import { Meteor } from "meteor/meteor";
import FileUpload from "./FileUpload";
import { FS } from "meteor/cfs:base-package";
import "../../../../../lib/client/pgnimportfilesystem.client";
/*
const PgnImports = new FS.Collection("uploaded_pgns", {
  stores: [new FS.Store.PGNImportFileSystem()]
});
*/

export default class UploadPGN extends FileUpload {
  uploadFile(file) {
    /*
    var msFile = new FS.File(file);
    msFile.creatorId = Meteor.userId();
    PgnImports.insert(msFile, function(err, fileObj) {
      if (!err) {
        Meteor.call("process_uploaded_pgn", "mi1", fileObj._id);
      } else {
        alert("Upload PGN error: " + err);
      }
    });
    */
  }
}
