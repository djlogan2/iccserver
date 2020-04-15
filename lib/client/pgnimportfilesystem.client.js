// On the client we have just a shell
import { FS } from "meteor/cfs:base-package";

FS.Store.PGNImportFileSystem = function() {
  var self = this;
  if (!(self instanceof FS.Store.PGNImportFileSystem))
    throw new Error('FS.Store.PGNImportFileSystem missing keyword "new"');

  return new FS.StorageAdapter("importpgns", null, {
    typeName: 'storage.pgnimportfilesystem'
  });
};
