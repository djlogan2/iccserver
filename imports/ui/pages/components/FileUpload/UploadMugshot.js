import { Meteor } from "meteor/meteor";
import FileUpload from "./FileUpload";
import { FS } from "meteor/cfs:base-package";

const MugshotCollection = new FS.Collection("mugshots", {
  stores: [new FS.Store.FileSystem("mugshots", { path: "uploads/mugshots" })]
});

export default class UploadMugshot extends FileUpload {
  uploadFile(file) {
    var msFile = new FS.File(file);
    msFile.creatorId = Meteor.userId();
    msFile.validated = false;
    MugshotCollection.insert(msFile, function(err, fileObj) {
      // if (!err) {
      //   Meteor.call("validatemugshot", "mi1", fileObj._id);
      //   //alert("Upload mugshot complete");
      //   // do callback stuff
      // } else {
      //   alert("Upload mugshot error: " + err);
      // }
    });
  }
}
