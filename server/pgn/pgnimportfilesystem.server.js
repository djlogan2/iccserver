import { FS } from "meteor/cfs:base-package";
import { PGNImportStorageAdapter } from "./PGNImportStorageAdapter";

FS.Store.PGNImportFileSystem = function() {
  var self = this;
  if (!(self instanceof FS.Store.PGNImportFileSystem)) throw new Error('FS.Store.PGNImportFileSystem missing keyword "new"');
  return new PGNImportStorageAdapter();
};
