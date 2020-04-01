import { Meteor } from "meteor/meteor";
import FileUpload from "./FileUpload";
import { FS } from "meteor/cfs:base-package";

const MugshotCollection = new FS.Collection("uploaded_pgns", {
  stores: [new FS.Store.FileSystem("uploaded_pgns", { path: "uploads/pgns" })]
});

export default class UploadPGN extends FileUpload {
  uploadFile(file) {
    var msFile = new FS.File(file);
    msFile.creatorId = Meteor.userId();
    msFile.validated = false;
    MugshotCollection.insert(msFile, function(err, fileObj) {
      if (!err) {
        Meteor.call("uploadpgn", "mi1", fileObj._id);
        //alert("Upload mugshot complete");
        // do callback stuff
      } else {
        alert("Upload PGN error: " + err);
      }
    });
  }
}
