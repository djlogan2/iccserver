var Token = require("antlr4/Token").Token;
var Lexer = require("antlr4/Lexer").Lexer;
var Interval = require("antlr4/IntervalSet").Interval;

function TokenStream() {
  return this;
}

function NodePGNTokenStream(tokenSource) {
  TokenStream.call(this);
  this.tokenSource = tokenSource;
  this.tokens = [];
  this.index = -1;
  this.fetchedEOF = false;
  return this;
}

NodePGNTokenStream.prototype = Object.create(TokenStream.prototype);
NodePGNTokenStream.prototype.constructor = NodePGNTokenStream;

NodePGNTokenStream.prototype.mark = function() {
  return 0;
};

NodePGNTokenStream.prototype.release = function(marker) {
  // no resources to release
  console.log("here");
};

NodePGNTokenStream.prototype.reset = function() {
  this.seek(0);
};

NodePGNTokenStream.prototype.seek = function(index) {
  this.lazyInit();
  this.index = this.adjustSeekIndex(index);
};

NodePGNTokenStream.prototype.get = function(index) {
  this.lazyInit();
  return this.tokens[index];
};

NodePGNTokenStream.prototype.consume = function() {
  var skipEofCheck = false;
  if (this.index >= 0) {
    if (this.fetchedEOF) {
      // the last token in tokens is EOF. skip check if p indexes any
      // fetched token except the last.
      skipEofCheck = this.index < this.tokens.length - 1;
    } else {
      // no EOF token in tokens. skip check if p indexes a fetched token.
      skipEofCheck = this.index < this.tokens.length;
    }
  } else {
    // not yet initialized
    skipEofCheck = false;
  }
  if (!skipEofCheck && this.LA(1) === Token.EOF) {
    throw "cannot consume EOF";
  }
  if (this.sync(this.index + 1)) {
    this.index = this.adjustSeekIndex(this.index + 1);
  }
};

// Make sure index {@code i} in tokens has a token.
//
// @return {@code true} if a token is located at index {@code i}, otherwise
// {@code false}.
// @see //get(int i)
// /
NodePGNTokenStream.prototype.sync = function(i) {
  var n = i - this.tokens.length + 1; // how many more elements we need?
  if (n > 0) {
    var fetched = this.fetch(n);
    return fetched >= n;
  }
  return true;
};

// Add {@code n} elements to buffer.
//
// @return The actual number of elements added to the buffer.
// /
NodePGNTokenStream.prototype.fetch = function(n) {
  if (this.fetchedEOF) {
    return 0;
  }
  for (var i = 0; i < n; i++) {
    var t = this.tokenSource.nextToken();
    t.tokenIndex = this.tokens.length;
    this.tokens.push(t);
    if (t.type === Token.EOF) {
      this.fetchedEOF = true;
      return i + 1;
    }
  }
  return n;
};

// Get all tokens from start..stop inclusively///
NodePGNTokenStream.prototype.getTokens = function(start, stop, types) {
  if (types === undefined) {
    types = null;
  }
  if (start < 0 || stop < 0) {
    return null;
  }
  this.lazyInit();
  var subset = [];
  if (stop >= this.tokens.length) {
    stop = this.tokens.length - 1;
  }
  for (var i = start; i < stop; i++) {
    var t = this.tokens[i];
    if (t.type === Token.EOF) {
      break;
    }
    if (types === null || types.contains(t.type)) {
      subset.push(t);
    }
  }
  return subset;
};

NodePGNTokenStream.prototype.LA = function(i) {
  return this.LT(i).type;
};

NodePGNTokenStream.prototype.LB = function(k) {
  if (this.index - k < 0) {
    return null;
  }
  return this.tokens[this.index - k];
};

NodePGNTokenStream.prototype.LT = function(k) {
  this.lazyInit();
  if (k === 0) {
    return null;
  }
  if (k < 0) {
    return this.LB(-k);
  }
  var i = this.index + k - 1;
  this.sync(i);
  if (i >= this.tokens.length) {
    // return EOF token
    // EOF must be last token
    return this.tokens[this.tokens.length - 1];
  }
  return this.tokens[i];
};

NodePGNTokenStream.prototype.adjustSeekIndex = function(i) {
  return i;
};

NodePGNTokenStream.prototype.lazyInit = function() {
  if (this.index === -1) {
    this.setup();
  }
};

NodePGNTokenStream.prototype.setup = function() {
  this.sync(0);
  this.index = this.adjustSeekIndex(0);
};

// Reset this token stream by setting its token source.///
NodePGNTokenStream.prototype.setTokenSource = function(tokenSource) {
  this.tokenSource = tokenSource;
  this.tokens = [];
  this.index = -1;
  this.fetchedEOF = false;
};

// Given a starting index, return the index of the next token on channel.
// Return i if tokens[i] is on channel. Return -1 if there are no tokens
// on channel between i and EOF.
// /
NodePGNTokenStream.prototype.nextTokenOnChannel = function(i, channel) {
  this.sync(i);
  if (i >= this.tokens.length) {
    return -1;
  }
  var token = this.tokens[i];
  while (token.channel !== this.channel) {
    if (token.type === Token.EOF) {
      return -1;
    }
    i += 1;
    this.sync(i);
    token = this.tokens[i];
  }
  return i;
};

// Given a starting index, return the index of the previous token on channel.
// Return i if tokens[i] is on channel. Return -1 if there are no tokens
// on channel between i and 0.
NodePGNTokenStream.prototype.previousTokenOnChannel = function(i, channel) {
  while (i >= 0 && this.tokens[i].channel !== channel) {
    i -= 1;
  }
  return i;
};

// Collect all tokens on specified channel to the right of
// the current token up until we see a token on DEFAULT_TOKEN_CHANNEL or
// EOF. If channel is -1, find any non default channel token.
NodePGNTokenStream.prototype.getHiddenTokensToRight = function(tokenIndex, channel) {
  if (channel === undefined) {
    channel = -1;
  }
  this.lazyInit();
  if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
    throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
  }
  var nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1, Lexer.DEFAULT_TOKEN_CHANNEL);
  var from_ = tokenIndex + 1;
  // if none onchannel to right, nextOnChannel=-1 so set to = last token
  var to = nextOnChannel === -1 ? this.tokens.length - 1 : nextOnChannel;
  return this.filterForChannel(from_, to, channel);
};

// Collect all tokens on specified channel to the left of
// the current token up until we see a token on DEFAULT_TOKEN_CHANNEL.
// If channel is -1, find any non default channel token.
NodePGNTokenStream.prototype.getHiddenTokensToLeft = function(tokenIndex, channel) {
  if (channel === undefined) {
    channel = -1;
  }
  this.lazyInit();
  if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
    throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
  }
  var prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1, Lexer.DEFAULT_TOKEN_CHANNEL);
  if (prevOnChannel === tokenIndex - 1) {
    return null;
  }
  // if none on channel to left, prevOnChannel=-1 then from=0
  var from_ = prevOnChannel + 1;
  var to = tokenIndex - 1;
  return this.filterForChannel(from_, to, channel);
};

NodePGNTokenStream.prototype.filterForChannel = function(left, right, channel) {
  var hidden = [];
  for (var i = left; i < right + 1; i++) {
    var t = this.tokens[i];
    if (channel === -1) {
      if (t.channel !== Lexer.DEFAULT_TOKEN_CHANNEL) {
        hidden.push(t);
      }
    } else if (t.channel === channel) {
      hidden.push(t);
    }
  }
  if (hidden.length === 0) {
    return null;
  }
  return hidden;
};

NodePGNTokenStream.prototype.getSourceName = function() {
  return this.tokenSource.getSourceName();
};

// Get the text of all tokens in this buffer.///
NodePGNTokenStream.prototype.getText = function(interval) {
  this.lazyInit();
  this.fill();
  if (interval === undefined || interval === null) {
    interval = new Interval(0, this.tokens.length - 1);
  }
  var start = interval.start;
  if (start instanceof Token) {
    start = start.tokenIndex;
  }
  var stop = interval.stop;
  if (stop instanceof Token) {
    stop = stop.tokenIndex;
  }
  if (start === null || stop === null || start < 0 || stop < 0) {
    return "";
  }
  if (stop >= this.tokens.length) {
    stop = this.tokens.length - 1;
  }
  var s = "";
  for (var i = start; i < stop + 1; i++) {
    var t = this.tokens[i];
    if (t.type === Token.EOF) {
      break;
    }
    s = s + t.text;
  }
  return s;
};

// Get all tokens from lexer until EOF///
NodePGNTokenStream.prototype.fill = function() {
  this.lazyInit();
  while (this.fetch(1000) === 1000) {
    continue;
  }
};

exports.NodePGNTokenStream = NodePGNTokenStream;
