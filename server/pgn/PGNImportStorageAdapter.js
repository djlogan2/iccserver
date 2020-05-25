import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FS } from "meteor/cfs:base-package";
import { Parser } from "./pgnsigh";

const stream = require("stream");
const async = require("async");
const parsers = {};

export const ImportedGameCollection = new Mongo.Collection("imported_games");
export const TempUploadCollection = new Mongo.Collection("temp_pgn_imports");

Meteor.publish("imported_games", function() {
  return ImportedGameCollection.find({ creatorId: Meteor.userId() });
});

function findTempRecord(fileKey, first) {
  return new Promise((resolve, reject) => {
    TempUploadCollection.rawCollection().findOne({ fileKey: fileKey }, (error, record) => {
      if (first)
        record.offset = 0;
      if (error) reject(error);
      else if (!record) reject(new Error("Unable to find temp record"));
      else resolve(record);
    });
  });
}

function parseUpToLastNewLine(temp, chunk) {
  return new Promise((resolve, reject) => {
    try {

      let start = 0;

      if (temp.offset < temp.size) {
        if ((temp.offset + chunk.length) <= temp.size) {
          temp.offset += chunk.length;
          resolve(temp);
          return;
        }
        start = temp.size - temp.offset;
        temp.offset += chunk.length - start;
        temp.size += chunk.length - start;
      } else {
        temp.size += chunk.length;
        temp.offset += chunk.length;
      }

      const parser = parsers[temp._id] === undefined ? new Parser() : parsers[temp._id];

      if (parsers[temp._id] === undefined)
        parsers[temp._id] = parser;

      let end = chunk.lastIndexOf("\n");

      if (end === -1 || end <= start) {
        temp.string = chunk.toString("utf8", start);
        resolve(temp);
      } else {
        end++;
        if (temp.string) {
          if (!temp.error) {
            parser.feed(temp.string + chunk.toString("utf8", start, end));
          }
        } else if (!temp.error) {
          parser.feed(chunk.toString("utf8", start, end));
        }
      }
      temp.string = chunk.toString("utf8", end);
      temp.gamelist = parser.gamelist;
      delete parser.gamelist;
      temp.gamelist.forEach(game => {
        game.creatorId = temp.creatorId;
        game.fileId = temp._id;
      });
      resolve(temp);
    } catch (e) {
      reject(e);
    }
  });
}

function finishIfFinished(temp) {
  return new Promise((resolve, reject) => {
    if (temp.size >= temp.originalsize) {
      if (temp.string) {
        try {
          parser.feed(temp.string);
          if (parser.gamelist && parser.gamelist.length) {
            if (temp.gamelist)
              temp.gamelist = temp.gamelist.concat(parser.gamelist);
            else
              temp.gamelist = parser.gamelist;
          }
        } catch (e) {
          reject(e);
        }
      }
      temp.complete = true;
      delete parsers[temp._id];
    }
    resolve(temp);
  });
}

function saveParsedGames(temp) {
  if (!temp.gamelist || !temp.gamelist.length)
    return Promise.resolve(temp);

  return new Promise((resolve, reject) => {
    ImportedGameCollection.rawCollection().insertMany(temp.gamelist, (err, res) => {
      delete temp.gamelist;
      if (err) reject(err);
      else resolve(temp);
    });
  });
}

function updateTempRecord(temp) {
  return new Promise((resolve, reject) => {
    TempUploadCollection.rawCollection().update({ _id: temp._id }, temp, (err, res) => {
      if (err) reject(err);
      else resolve(temp);
      testme = 0;
    });
  });
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
      offset: 0,
      string: null
    });
  return fileObj._id;
};

PGNImportStorageAdapter.prototype.createReadStream = function(fileKey, options) {
  console.log("--- CREATEREADSTREAM ---");
  return null;
};

const q = async.queue(function(work, callback) {
  let data = false;
  let ended = false;
  let first = true;

  work.stream.on("data", function(chunk) {
    this.pause();
    data = true;
    const self = this;

    findTempRecord(work.fileKey, first)
      .then((temp) => parseUpToLastNewLine(temp, chunk))
      .then((temp) => finishIfFinished(temp))
      .then((temp) => saveParsedGames(temp))
      .then((temp) => updateTempRecord(temp))
      .finally(() => {
        data = false;
        first = false;
        self.resume();
        if (ended) {
          callback();
        }
      });
  });

  work.stream.on("end", function() {
    ended = true;
    if (!data) {
      callback();
    }
  });
}, 1);

PGNImportStorageAdapter.prototype.createWriteStream = function(fileKey) {
  const pass = new stream.PassThrough();
  q.push({ fileKey: fileKey, stream: pass }, (err) => {
  });
  return pass;
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
