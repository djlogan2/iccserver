import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FS } from "meteor/cfs:base-package";
const stream = require("stream");
const nearley = require("nearley");
const grammar = require("./pgn.js");

export const PGNImportStorageAdapter = function() {
  FS.StorageAdapter.call(this, "imported_pgns", null, this);
};

PGNImportStorageAdapter.prototype = Object.create(FS.StorageAdapter.prototype);

PGNImportStorageAdapter.prototype.typeName = "storage.pgnimportfilesystem";

PGNImportStorageAdapter.prototype.fileKey = function(fileObj) {
  return fileObj._id;
};

PGNImportStorageAdapter.prototype.createReadStream = function(fileKey, options) {
  return null;
};

PGNImportStorageAdapter.prototype.createWriteStream = function(fileKey) {
  var indeed = stream.PassThrough();
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  indeed.on('readable', () => {
    let buffer = [""];
    let chunk;

    while(null !== (chunk = indeed.read())) {
      console.log('chunk=' + chunk);
      const strings = chunk.toString().split("\n");
      buffer[buffer.length - 1] += strings.shift();
      buffer = buffer.concat(strings);
      while(buffer.length > 1) {
        const str = buffer.shift();
        console.log("str=" + str);
        parser.feed(str);
      }
    }
  })

  indeed.on('end', () => {
    console.log(parser.results);
  })

  return indeed;
};

PGNImportStorageAdapter.prototype.remove = function(fileKey, callback) {
  /*
    // this is the Storage adapter scope
    var filepath = path.join(absolutePath, fileKey);

    // Call node unlink file
    fs.unlink(filepath, function(error, result) {
      if (error && error.errno === 34) {
        console.warn(
          "SA FileSystem: Could not delete " + filepath + " because the file was not found."
        );
        callback && callback(null);
      } else {
        callback && callback(error, result);
      }
    });
*/
};

PGNImportStorageAdapter.prototype.stats = function(fileKey, callback) {
  /*
    // this is the Storage adapter scope
    var filepath = path.join(absolutePath, fileKey);
    if (typeof callback === "function") {
      fs.stat(filepath, callback);
    } else {
      return fs.statSync(filepath);
    }
  }
*/
};

PGNImportStorageAdapter.prototype.parse = function(chunk) {};
