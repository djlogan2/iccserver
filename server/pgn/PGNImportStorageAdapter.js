import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FS } from "meteor/cfs:base-package";
import { Parser } from "./pgnsigh";

const stream = require("stream");
const parsers = {};

const GameCollection = new Mongo.Collection("imported_games");
const TempUploadCollection = new Mongo.Collection("temp_pgn_imports");
let testme = 0;

function findTempRecord(fileKey) {
  return new Promise((resolve, reject) => {
    console.log("START findTempRecord");
    TempUploadCollection.rawCollection().findOne({ fileKey: fileKey }, (error, record) => {
      if (error) reject(error);
      else if (!record) reject(new Error("Unable to find temp record"));
      else resolve(record);
      console.log("END   findTempRecord");
    });
  });
}

function parseUpToLastNewLine(temp, chunk) {
  return new Promise((resolve, reject) => {
    console.log("START parseUpToLastNewLine");
    try {

      const parser = parsers[temp._id] === undefined ? new Parser() : parsers[temp._id];
      if (parsers[temp._id] === undefined)
        parsers[temp._id] = parser;

      let end = chunk.lastIndexOf("\n");

      if (end === -1) {
        temp.string = chunk.toString("utf8");
        resolve(temp);
      } else {
        end++;
        if (temp.string) {
          if (!temp.error) {
            parser.feed(temp.string + chunk.toString("utf8", 0, end));
          }
        } else if (!temp.error) {
          parser.feed(chunk.toString("utf8", 0, end));
        }
      }
      temp.string = chunk.toString("utf8", end);
      temp.gamelist = parser.gamelist;
      delete parser.gamelist;
      resolve(temp);
      console.log("END   parseUpToLastNewLine");
    } catch (e) {
      reject(e);
    }
  });
}

function finishIfFinished(temp) {
  return new Promise((resolve, reject) => {
    console.log("START finishIfFinished");
    if (temp.size >= temp.originalsize) {
      if (temp.string) {
        try {
          parser.feed(temp.string);
          if(parser.gamelist && parser.gamelist.length) {
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
    console.log("END   finishIfFinished");
  });
}

function saveParsedGames(temp) {
  if(!temp.gamelist || !temp.gamelist.length)
    return Promise.resolve(temp);

  return new Promise((resolve, reject) => {
    console.log("START saveParsedGames");
    GameCollection.rawCollection().insertMany(temp.gamelist, (err, res) => {
      delete temp.gamelist;
      if(err) reject(err);
      else resolve(temp);
      console.log("END   saveParsedGames");
    });
  });
}

function updateTempRecord(temp) {
  return new Promise((resolve, reject) => {
    console.log("START updateTempRecord");
    TempUploadCollection.rawCollection().update({_id: temp._id},temp, (err, res) => {
      if(err) reject(err);
      else resolve(temp);
      console.log("END   updateTempRecord");
      testme = 0;
    });
  });
}

class MyWriter extends stream.Writable {
  constructor(fileKey) {
    console.log("MyWriter()");
    super({});
    this.fileKey = fileKey;
  }

  _write(chunk, encoding, callback) {
    const self = this;
    this.pause();
    console.log("START _write");
    findTempRecord(this.fileKey)
      .then((temp) => parseUpToLastNewLine(temp, chunk))
      .then((temp) => finishIfFinished(temp))
      .then((temp) => saveParsedGames(temp))
      .then((temp) => updateTempRecord(temp))
      .then(() => self.resume())
      .then(() => callback())
      .catch((err) => callback(err));
    console.log("END   _write");
  }

  _xxxwrite(chunk, encoding, callback) {
    ///
    TempUploadCollection.rawCollection().findOne({ fileKey: this.fileKey }, (e0, temp) => {
      if (e0) {
        callback(new Error(e0));
        return;
      }

      if (!temp)
        throw new Error("Unable to find temp record for PGNImportAdapter for id " + fileKey);

      console.log("START  MyWriter::_write, chunk=" + chunk.toString("utf8", 0, 100));
      const parser = parsers[temp._id] === undefined ? new Parser() : parsers[temp._id];
      if (parsers[temp._id] === undefined)
        parsers[temp._id] = parser;

      temp.chunks++;
      temp.size += chunk.length;
      let end;

      try {
        end = chunk.lastIndexOf("\n");
        if (end === -1) {
          temp.string = chunk.toString("utf8");
        } else {
          end++;
          if (temp.string) {
            if (!temp.error) {
              parser.feed(temp.string + chunk.toString("utf8", 0, end));
            }
          } else if (!temp.error) {
            parser.feed(chunk.toString("utf8", 0, end));
          }
        }
        temp.string = chunk.toString("utf8", end);
      } catch (e) {
        temp.error = e;
        temp.error_line = e.toString();
      } finally {

        if (temp.size >= temp.originalsize) {
          if (temp.string) {
            try {
              parser.feed(temp.string);
            } catch (e) {
              temp.error = e;
              temp.error_line = e.toString();
            }
          }
          temp.complete = true;
          delete parsers[temp._id];
        }

        if (parser.gamelist && parser.gamelist.length) {
          GameCollection.rawCollection().insertMany(parser.gamelist, (e1, r1) => {
            delete parser.gamelist;
            if (e1) {
              if (temp.error_line) temp.error_line += "\n" + e1.toString();
              else temp.error_line = e1.toString();
            }
            TempUploadCollection.rawCollection().update({ _id: temp._id }, temp, (e2, r2) => {
              if (e2) {
                if (temp.error_line) temp.error_line += "\n" + e2.toString();
                else temp.error_line = e2.toString();
              }
              if (temp.error_line)
                callback(new Error(temp.error_line));
              else callback();
            });
          });
        } else {
          TempUploadCollection.rawCollection().update({ _id: temp._id }, temp, (e1, r1) => {
            if (e1) {
              if (temp.error_line) temp.error_line += "\n" + e1.toString();
              else temp.error_line = e1.toString();
            }
            if (temp.error_line)
              callback(new Error(temp.error_line));
            else callback();
          });
        }
      }
      console.log("END  MyWriter::_write");
    });
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
  return new MyWriter(fileKey);
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
