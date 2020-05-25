import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

const Mugshots = new FilesCollection({
  collectionName: "Mugshots",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return "Please upload image, with size equal or less than 10MB";
  }
});

const ImportedPGNS = new FilesCollection({
  collectionName: "ImportedPGNs",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /pgn/i.test(file.extension)) {
      return true;
    }
    return "Please upload PGN, with size equal or less than 10MB";
  }
});

if (Meteor.isClient) {
  Meteor.subscribe("files.mugshots.all");
}

if (Meteor.isServer) {
  Meteor.publish("files.mugshots.all", function() {
    return Mugshots.find().cursor;
  });
}
