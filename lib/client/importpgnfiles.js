import { FilesCollection } from "meteor/ostrio:files";

export const ImportedPgnFiles = new FilesCollection({
  collectionName: "importedPgnFiles",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (/*file.size <= 10485760 && */ /pgn/i.test(file.extension)) {
      return true;
    }
    return "Please upload PGN file";
  }
});
