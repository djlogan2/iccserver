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

const current = {};

PGNImportStorageAdapter.prototype.createWriteStream = function(fileKey) {
  const indeed = stream.PassThrough();
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  if(!current[fileKey]) {
    current[fileKey] = {
      line: 0,
      error: false,
      string: null,
      sigh: 0
    };
  }

  indeed.on("data", (chunk) => {
    let start = 0;
    let end;

    if((++current[fileKey].sigh % 10000) === 0) console.log("chunks=" + current[fileKey].sigh);
    return;
    do {
      end = chunk.indexOf('\n', start, "utf8");
      if (end === -1) {
        current[fileKey].string = chunk.toString("utf8", start);
        start = chunk.length;
      } else {
        end++;
        if(current[fileKey].string) {
          console.log(current[fileKey].string + chunk.toString("utf8", start, end));
          current[fileKey].string = null;
        } else
          console.log(chunk.toString("utf8", start, end));
        start = end;
        current[fileKey].line++;
      }
    } while (start < chunk.length);
  });

  indeed.on("end", (fileKey) => console.log("Ending " + fileKey));
  indeed.on('stored', (fileKey) => {
    if(current[fileKey].string) {
      console.log(current[fileKey].string);
      current[fileKey].line++;
    }
    console.log("does this work?");
    console.log("lines=" + current[fileKey].line);
    delete current[fileKey];
  });

  // while (!error && null !== (chunk = indeed.read())) {
  //   console.log("--- new chunk=" + chunk.slice(0, 10));
  //   const strings = chunk.toString().split("\n");
  //   buffer[buffer.length - 1] += strings.shift();
  //   buffer = buffer.concat(strings);
  //   while (!error && buffer.length > 1) {
  //     const str = buffer.shift();
  //     try {
  //       console.log("str=" + str);
  //       parser.feed(str);
  //       line++;
  //     } catch (e) {
  //       console.log("Error in line " + line + ": " + e);
  //       error = true;
  //     }
  //   }
  // }
//};
//)

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
