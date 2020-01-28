require("antlr4/polyfills/codepointat");
require("antlr4/polyfills/fromcodepoint");

const Token = require('antlr4/Token').Token;
const fs = require('fs');

function NodeInputStream(fileName, decodeToUnicodeCodePoints) {
  this.name = "<empty>";
  this.file = fs.openSync(fileName);
  this._size = fs.statSync(fileName).size;
  this._bytesRead = 0;
  return this;
}

Object.defineProperty(NodeInputStream.prototype, "index", {
  get: function() {
    return this._bytesRead;
  }
});

Object.defineProperty(NodeInputStream.prototype, "size", {
  get: function() {
    return this._size;
  }
});

// Reset the stream so that it's in the same state it was
// when the object was created *except* the data array is not
// touched.
//
NodeInputStream.prototype.reset = function() {/*console.log("reset called")*/};

NodeInputStream.prototype.consume = function() {/*console.log("consume called")*/};

/**
 * @return {number}
 */
NodeInputStream.prototype.LA = function(offset) {
  if (offset === 0) {
    return 0; // undefined
  }
  if (offset < 0) {
    offset += 1; // e.g., translate LA(-1) to use offset=0
  }
  var pos = this._bytesRead + offset - 1;
  if (pos < 0 || pos >= this._size) { // invalid
    return Token.EOF;
  }
  return this.getText(pos, pos + 1); //this.data[pos];
};

/**
 * @return {number}
 */
NodeInputStream.prototype.LT = function(offset) {
  return this.LA(offset);
};

// mark/release do nothing; we have entire buffer
NodeInputStream.prototype.mark = function() {
  return "no need";
};

NodeInputStream.prototype.release = function(marker) {
};

NodeInputStream.prototype.seek = function(_index) {
  if (_index <= this._bytesRead) {
    this._bytesRead = _index;
    return;
  }
  this._bytesRead = Math.min(_index, this._size);
};

NodeInputStream.prototype.getText = function(start, stop) {
  console.log("getText(" + start + "," + stop + ")");
  if (stop >= this._size) {
    stop = this._size - 1;
  }
  if (start >= this._size) {
    return "";
  } else {
    const result = new Buffer(stop - start);
    fs.readSync(this.file, result, 0, stop - start, start);
    this._bytesRead = stop;
    return result.toString();
  }
};

exports.NodeInputStream = NodeInputStream;
