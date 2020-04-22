import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FS } from "meteor/cfs:base-package";
import { Parser } from "./pgnsigh";

const stream = require("stream");

const parsers = {};

const GameCollection = new Mongo.Collection("imported_games");
const TempUploadCollection = new Mongo.Collection("temp_pgn_imports");

const update = Meteor.bindEnvironment((temp, callback) => {
  let count = 0;
  if (temp.gamelist && temp.gamelist.length) {
    console.log("Saving " + temp.gamelist.length + " games");
    temp.gamelist.forEach(game => GameCollection.insert(game, e1 => {
      if (++count === temp.gamelist.length) {
        delete temp.gamelist;
        TempUploadCollection.update({ _id: temp._id }, temp, e2 => {
          if (callback && typeof callback === "function") {
            let err = temp.error_line || "";
            if (e1) err += ":" + e1.toString();
            if (e2) err += ":" + e2.toString();
            if (err && err.length)
              callback(new Error(err));
            else
              callback();
          }
        });
      } else {
        TempUploadCollection.update({ _id: temp._id }, temp, e2 => {
          if(callback && typeof callback === "function") {
            if (temp.error_line)
              callback(new Error(temp.error_line));
            else if (e2)
              callback(new Error(e2));
            else
              callback();
          }
        });
      }
    }));
  }
});

class MyWriter extends stream.Writable {
  constructor(temp) {
    super({});
    this.temp = temp;
  }

  _write(chunk, encoding, callback) {
    const parser = parsers[this.temp._id] === undefined ? new Parser() : parsers[this.temp._id];
    if (parsers[this.temp._id] === undefined)
      parsers[this.temp._id] = parser;

    this.temp.chunks++;
    this.temp.size += chunk.length;
    let end;

    try {
      end = chunk.lastIndexOf("\n");
      if (end === -1) {
        this.temp.string = chunk.toString("utf8");
      } else {
        end++;
        if (this.temp.string) {
          if (!this.temp.error) {
            parser.feed(this.temp.string + chunk.toString("utf8", 0, end));
          }
        } else if (!this.temp.error) {
          parser.feed(chunk.toString("utf8", 0, end));
        }
      }
      this.temp.string = chunk.toString("utf8", end);
      this.temp.gamelist = parser.gamelist;
      delete parser.gamelist;
    } catch (e) {
      this.temp.error = e;
      this.temp.error_line = e.toString();
    } finally {
      if (this.temp.size >= this.temp.originalsize) {
        if (this.temp.string) {
          parser.feed(this.temp.string);
        }
        delete parsers[this.temp._id];
        this.temp.complete = true;
      }
      update(this.temp, callback);
    }
  }
}

export const PGNImportStorageAdapter = function() {
  FS.StorageAdapter.call(this, "imported_pgns", null, this);
};

PGNImportStorageAdapter.prototype = Object.create(FS.StorageAdapter.prototype);

PGNImportStorageAdapter.prototype.typeName = "storage.pgnimportfilesystem";

PGNImportStorageAdapter.prototype.fileKey = function(fileObj) {
  const temp = TempUploadCollection.findOne({
    fileKey: fileObj._id
  }, { _id: 1 });
  if (!temp)
    TempUploadCollection.insert({
      fileKey: fileObj._id,
      creatorId: fileObj.creatorId,
      name: fileObj.original.name,
      line: 0,
      chunks: 0,
      originalsize: fileObj.original.size,
      size: 0,
      string: null
    });
  return fileObj._id;
};

PGNImportStorageAdapter.prototype.createReadStream = function(fileKey, options) {
  console.log("--- CREATEREADSTREAM ---");
  return null;
};

PGNImportStorageAdapter.prototype.createWriteStream = function(fileKey) {
  const temp = TempUploadCollection.findOne({ fileKey: fileKey });

  if (!temp)
    throw new Error("Unable to find temp record for PGNImportAdapter for id " + fileKey);

  return new MyWriter(temp);
};

PGNImportStorageAdapter.prototype.remove = function(fileKey, callback) {
  console.log("--- REMOVE ---");
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
  console.log("--- STATS ---");
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
  console.log("--- PARSE ---");
};
