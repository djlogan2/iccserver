require("antlr4/polyfills/codepointat");
require("antlr4/polyfills/fromcodepoint");

const Token = require("antlr4/Token").Token;
const fs = require("fs");

function NodeInputStream(fileName, decodeToUnicodeCodePoints) {
  this.name = fileName;
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

NodeInputStream.prototype.reset = function() {
  this._bytesRead = 0;
};

NodeInputStream.prototype.consume = function() {
  if (this._index >= this._bytesRead) {
    throw new Error("cannot consume EOF");
  }
  this._bytesRead += 1;
};

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
  if (pos < 0 || pos >= this._size) {
    return Token.EOF;
  }

  if (
    !this._currentBuffer ||
    this._currentBufferStart > pos ||
    this._currentBufferStart + this._currentBuffer.length <= pos
  ) {
    let size = 1024;
    if (pos + size > this._size) size = this._size - pos;
    const buffer = new Buffer(size);
    fs.readSync(this.file, buffer, 0, size, pos);
    this._currentBuffer = buffer;
    this._currentBufferStart = pos;
  }

  return this._currentBuffer[pos - this._currentBufferStart];
};

/**
 * @return {number}
 */
NodeInputStream.prototype.LT = function(offset) {
  return this.LA(offset);
};

NodeInputStream.prototype.mark = function() {
  return -1;
};

NodeInputStream.prototype.release = function(marker) {}; //console.log("release, bytesRead=" + this._bytesRead);};

NodeInputStream.prototype.seek = function(_index) {
  if (_index <= this._bytesRead) {
    this._bytesRead = _index;
    return;
  }
  this._bytesRead = Math.min(_index, this._size);
};

NodeInputStream.prototype.getText = function(start, stop) {
  stop++; // Easy fix because the other input streams include the stop byte. Rather than figure out how to change the logic, just add one to stop.
  if (stop >= this._size) stop = this._size - 1;

  if (start >= this._size) return "";

  if (
    !this._currentBuffer ||
    this._currentBufferStart > start ||
    this._currentBufferStart + this._currentBuffer.length <= stop
  ) {
    let size = stop - start;
    if (size < 1024) size = 1024;
    if (start + size > this._size) size = this._size - start;
    const buffer = new Buffer(size);
    fs.readSync(this.file, buffer, 0, size, start);
    this._currentBuffer = buffer;
    this._currentBufferStart = start;
  }

  return this._currentBuffer.toString(
    "utf8",
    start - this._currentBufferStart,
    stop - this._currentBufferStart
  );
};

exports.NodeInputStream = NodeInputStream;
