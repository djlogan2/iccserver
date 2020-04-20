import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FS } from "meteor/cfs:base-package";

const stream = require("stream");
const nearley = require("nearley");
const grammar = require("./pgn.js");

const TempUploadCollection = new Mongo.Collection("temp_pgn_imports");

export const PGNImportStorageAdapter = function() {
  FS.StorageAdapter.call(this, "imported_pgns", null, this);
};

PGNImportStorageAdapter.prototype = Object.create(FS.StorageAdapter.prototype);

PGNImportStorageAdapter.prototype.typeName = "storage.pgnimportfilesystem";

const current = {};

PGNImportStorageAdapter.prototype.fileKey = function(fileObj) {
  const temp = TempUploadCollection.findOne({ creatorId: fileObj.creatorId, name: fileObj.original.name, complete: {$ne: true}}, {_id: 1});
  if(temp)
    return temp._id;
  return TempUploadCollection.insert({
    creatorId: fileObj.creatorId,
    name: fileObj.original.name,
    line: 0,
    chunks: 0,
    originalsize: fileObj.original.size,
    size: 0,
    string: null
  });
}

PGNImportStorageAdapter.prototype.createReadStream = function(fileKey, options) {
  return null;
};

const parsers = {};

PGNImportStorageAdapter.prototype.createWriteStream = function(fileKey) {
  const temp = TempUploadCollection.findOne({_id: fileKey, complete: {$ne: true}});

  if(!temp)
    throw new Error("Unable to find temp record for PGNImportAdapter for id " + fileKey);

  const parser = parsers[fileKey] === undefined ? new nearley.Parser(nearley.Grammar.fromCompiled(grammar)) : parsers[fileKey];
  if(parsers[fileKey] === undefined)
    parsers[fileKey] = parser;

  const indeed = stream.PassThrough();

  indeed.on("data", Meteor.bindEnvironment(chunk => {
    indeed.pause();
    temp.chunks++;
    temp.size += chunk.length;
    let start = 0;
    let end;

    try {
      do {
        end = chunk.lastIndexOf("\n");
        if (end === -1) {
          temp.string = chunk.toString("utf8", start);
          start = chunk.length;
        } else {
          end++;
          temp.line++;
          if (temp.string) {
            if(!temp.error)
              parser.feed(temp.string + chunk.toString("utf8", start, end));
            temp.string = null;
          } else if(!temp.error) {
              parser.feed(chunk.toString("utf8", start, end));
          }
          start = end;
        }
      } while (start < chunk.length);
    } catch(e) {
      console.log(e);
      temp.error = e;
      temp.error_line = e.toString();
      //temp.error_line = [temp.line, (temp.string ? temp.string : "") + chunk.toString("utf8", start, end)];
    } finally {
      TempUploadCollection.update({ _id: fileKey }, temp);
      //-
      if(temp.size >= temp.originalsize) {
        if (temp.string) {
          parser.feed(temp.string);
          temp.line++;
        }
        delete parsers[fileKey];

        indeed.emit('stored', {
          fileKey: fileKey,
          size: temp.size,
          storedAt: new Date()
        });
        TempUploadCollection.update({_id: fileKey}, {$set: {complete: true}});
      }
      //-
      indeed.resume();
    }
  }));

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

PGNImportStorageAdapter.prototype.parse = function(chunk) {
};
