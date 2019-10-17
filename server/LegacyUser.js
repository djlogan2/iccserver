import { decrypt } from "../lib/server/encrypt";
import { Logger } from "../lib/server/Logger";
import { Roles } from "meteor/alanning:roles";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Game } from "./Game";
import { GameRequests } from "./GameRequest";
import { ClientMessages } from "../imports/collections/ClientMessages";
import net from "net";

import * as L2 from "../lib/server/l2";
//import * as CN from "../lib/server/cn";
//import { check } from "meteor/check";

const legacyUsers = new Mongo.Collection("legacyUsers");
Meteor.startup(function() {
  legacyUsers.remove({}); // Start off with a clean collection upon startup
});

Meteor.publish("legacyUsers", function() {
  return legacyUsers.find();
});

let log = new Logger("server/LegacyUser_js");
let log_rawlegacy = new Logger("server/LegacyUser_js:rawlegacy");

/*
 * The packets the admin user will receive for saving and publishing.
 */
const ADMIN_LEVEL2_PACKETS = [
  L2.WHO_AM_I,
  L2.LOGIN_FAILED,
  L2.CHANNEL_QTELL,
  L2.CHANNEL_TELL
];

/*
 * The packets a normal legacy user will receive for saving and publishing.
 */
const USER_LEVEL2_PACKETS = [
  L2.WHO_AM_I,
  L2.LOGIN_FAILED,
  L2.MOVE_ALGEBRAIC,
  L2.MOVE_CLOCK,
  L2.MOVE_LIST,
  //    L2.MOVE_SMITH,
  //    L2.MOVE_TIME,
  L2.IS_VARIATION,
  L2.SET2,
  L2.ERROR,
  L2.MESSAGELIST_BEGIN,
  L2.MESSAGELIST_ITEM,
  L2.PERSONAL_QTELL,
  L2.PERSONAL_TELL,
  L2.PERSONAL_TELL_ECHO,
  L2.STARTED_OBSERVING,
  L2.STOP_OBSERVING,
  L2.PLAYERS_IN_MY_GAME,
  L2.OFFERS_IN_MY_GAME,
  L2.TAKEBACK,
  L2.BACKWARD,
  L2.SEND_MOVES,
  L2.MY_GAME_CHANGE,
  L2.MY_GAME_ENDED,
  L2.MY_GAME_RESULT,
  L2.MY_GAME_STARTED,
  L2.MSEC,
  L2.PLAYER_ARRIVED,
  L2.OPEN,
  L2.TITLES,
  L2.STATE,
  L2.BULLET,
  L2.BLITZ,
  L2.STANDARD,
  L2.WILD,
  L2.BUGHOUSE,
  L2.LOSERS,
  L2.CRAZYHOUSE,
  L2.FIVEMINUTE,
  L2.ONEMINUTE,
  L2.CORRESPONDENCE_RATING,
  L2.FIFTEENMINUTE,
  L2.THREEMINUTE,
  L2.FORTYFIVEMINUTE,
  L2.CHESS960,
  L2.PLAYER_LEFT,
  L2.MUGSHOT,
  L2.MATCH,
  L2.SEEK,
  L2.SEEK_REMOVED
];

const legacy_ratings_on_login = {};
legacy_ratings_on_login[L2.BULLET] = "bullet";
legacy_ratings_on_login[L2.BLITZ] = "blitz";
legacy_ratings_on_login[L2.STANDARD] = "standard";
legacy_ratings_on_login[L2.WILD] = "wild";
legacy_ratings_on_login[L2.BUGHOUSE] = "bughouse";
legacy_ratings_on_login[L2.LOSERS] = "losers";
legacy_ratings_on_login[L2.CRAZYHOUSE] = "crazyhouse";
legacy_ratings_on_login[L2.FIVEMINUTE] = "fiveminute";
legacy_ratings_on_login[L2.ONEMINUTE] = "oneminute";
legacy_ratings_on_login[L2.CORRESPONDENCE_RATING] = "correspondence";
legacy_ratings_on_login[L2.FIFTEENMINUTE] = "fifteenminute";
legacy_ratings_on_login[L2.THREEMINUTE] = "threeminute";
legacy_ratings_on_login[L2.FORTYFIVEMINUTE] = "computerpool";
legacy_ratings_on_login[L2.CHESS960] = "chess960";

const sorted_legacy_ratings = [];
for (let k in legacy_ratings_on_login) {
  if (legacy_ratings_on_login.hasOwnProperty(k)) {
    sorted_legacy_ratings.push(k);
  }
}

sorted_legacy_ratings.sort((a, b) => {
  return parseInt(a) - parseInt(b);
});

const legacy_user_map = {};

const LEVEL1EMPTY = -1;
const LEVEL1ENDED = -2;

const IN_BETWEEN = 0;
const IN_SIMPLE_PARM = 1;
const IN_BRACKETS_PARM = 2;
const IN_CONTROL_BRACKETS_PARM = 3;

const CONTROL_Y = String.fromCharCode(25);
const CONTROL_Z = String.fromCharCode(26);

class LegacyUserConnection {
  constructor(user) {
    this.user = user;
    this.state = "login";
    this.databuffer = "";
    this.ctrl = false;
    this.level1 = LEVEL1EMPTY;
    this.level1Array = [];
    this.level2Array = [];
    this.currentLevel1 = "";
    this.currentLevel2 = "";
    this.socket = new net.Socket();
  }

  login() {
    let self = this;

    self.socket.connect({
      host: "chessclub.com",
      port: 23
    });

    self.socket.setEncoding("utf8");

    setTimeout(
      Meteor.bindEnvironment(function() {
        //TODO: What do we do here?
        // eslint-disable-next-line no-console
        console.log("server/legacyuser: why are we here");
        log.error("server/legacyuser: why are we here");
      })
    );

    self.socket.on(
      "data",
      Meteor.bindEnvironment(
        function(data) {
          self.databuffer += data;
          log_rawlegacy.debug("LegacyUser::(self.socket.on.data)", {
            state: self.state,
            databuffer: self.databuffer,
            ctrl: self.ctrl,
            level1: self.level1,
            level1Array: self.level1Array,
            level2Array: self.level2Array,
            currentLevel1: self.currentLevel1,
            currentLevel2: self.currentLevel2
          });
          let packets = null;
          do {
            packets = self.parse();
            log_rawlegacy.debug("LegacyUser::(self.socket.on.data)", {
              packets: packets
            });
            if (packets) {
              if (
                packets.level2Packets.length &&
                packets.level2Packets[0].packet.indexOf("69 5") === 0
              ) {
                self.socket.write(
                  decrypt(self.user.profile.legacy.password) + "\n"
                );
              } else {
                self.processPackets(packets);
              }
            }
          } while (packets);
        },
        function(error) {
          log.fatal("failed to bind to environment: " + error);
          throw new Meteor.Error("failed to bind environment: " + error);
        }
      )
    );

    self.socket.on("error", function(e) {
      self.processError(self.user._id, e);
    });
  }

  logout() {
    log.debug("LegacyUser::logout");
    this.socket.write("quit\n");
    this.socket.destroy();
  }

  parse() {
    if (this.state === "login") {
      if (this.databuffer.indexOf("login") !== -1) {
        this.databuffer = "";
        this.socket.write("level1=15\n");
        this.socket.write(
          "level2settings=" + L2.LEVEL2STRING(USER_LEVEL2_PACKETS) + "\n"
        );
        this.socket.write(this.user.profile.legacy.username + "\n");
        this.state = "password";
        return;
      }
    }

    try {
      for (let bx = 0; bx < this.databuffer.length; bx++) {
        let by = this.databuffer.charAt(bx);
        // noinspection FallThroughInSwitchStatementJS
        switch (by) {
          case CONTROL_Y:
            this.ctrl = true;
            break;
          case "[":
            // TODO: This isn't exactly right either. We shouldn't be processing any level 1 ever if we are in a level 2. Fix me.
            if (this.ctrl) {
              this.ctrl = false;
              if (this.level1 > LEVEL1EMPTY) {
                if (this.level1Array.length > this.level1) {
                  this.level1Array[this.level1] = this.currentLevel1;
                } else {
                  this.level1Array.push(this.currentLevel1);
                }
              }
              this.level1++;
              if (this.level1Array.length > this.level1) {
                this.currentLevel1 = this.level1Array[this.level1];
              } else {
                this.currentLevel1 = "";
              }
            } else if (this.level2) {
              this.currentLevel2 += "[";
            } else {
              this.currentLevel1 += "[";
            }
            break;
          // I think ^Z is when we "overflow ICC's buffer", which is a very bad thing. Using this hack will get you through
          // the hole (and processing continues), but it LOSES DATA!!
          case CONTROL_Z:
            // ^Z Means ICC and their dumb decsions have hit us again. They had some sort of "buffer overrun",
            // and can't send us the rest of our data, even though there should be no earthly reason that they have
            // this problem. Nevertheless, we have to RESET and RECOVER.
            this.ctrl = true;
            this.level1 = LEVEL1EMPTY + 1;
          // eslint-disable-next-line no-fallthrough
          case "]":
            // TODO: This isn't exactly right either. We shouldn't be processing any level 1 ever if we are in a level 2. Fix me.
            if (this.ctrl) {
              this.ctrl = false;
              if (this.level1 === LEVEL1ENDED) {
                log.error(
                  "We are in the logout section of having no packets left!!!"
                );
                return; // We get here when we close our last packet (i.e. logging/logged off!)
                //TODO: We have to figure out how to convey that, then clean up
              }
              if (this.level1Array.length > this.level1) {
                this.level1Array[this.level1] = this.currentLevel1;
              } else {
                this.level1Array.push(this.currentLevel1);
              }
              if (--this.level1 === LEVEL1EMPTY) {
                this.currentLevel1 = "";
                this.databuffer = this.databuffer.substr(bx + 1);
                let ret = {
                  level1Packets: this.level1Array,
                  level2Packets: this.level2Array
                };
                this.level1Array = [];
                this.level2Array = [];
                return ret;
              } else this.currentLevel1 = this.level1Array[this.level1];
            } else if (this.level2) {
              this.currentLevel2 += "]";
            } else {
              this.currentLevel1 += "]";
            }
            break;
          case "(":
            if (this.ctrl) {
              this.ctrl = false;
              this.level2 = true;
              this.currentLevel2 = "";
            } else if (this.level2) {
              this.currentLevel2 += "(";
            } else {
              this.currentLevel1 += "(";
            }
            break;
          case ")":
            if (this.ctrl) {
              this.ctrl = false;
              this.level2 = false;
              let hdrstr =
                this.level1Array.length > 0
                  ? this.level1Array[0]
                  : this.currentLevel1;
              hdrstr.replace(/([\n\r])+$/, "");
              let cl1 = hdrstr.split(/(\s+)/);
              this.level2Array.push({
                l1key: this.level1,
                l1index: cl1.length === 3 ? cl1[2] : null,
                packet: this.currentLevel2
              });
              this.currentLevel2 = "";
            } else if (this.level2) {
              this.currentLevel2 += ")";
            } else {
              this.currentLevel1 += ")";
            }
            break;
          default:
            if (this.ctrl) {
              // noinspection StatementWithEmptyBodyJS
              if (by === ">" || by === "<");
              else if (this.level2) {
                // Ignore these CTRL-whatever-they-are's
                this.currentLevel2 += String.fromCharCode(25);
              } else {
                this.currentLevel1 += String.fromCharCode(25);
              }
              this.ctrl = false;
            }
            if (this.level2) {
              this.currentLevel2 += by;
            } else {
              this.currentLevel1 += by;
            }
            break;
        }
      }
      this.databuffer = "";
    } catch (e) {
      log.error(e);
      this.processError(e);
    }
  }

  match(name, time, increment, time2, increment2, rated, wild, color) {
    let matchString = "match " + name + " " + time;
    if (increment) matchString += " " + increment;
    if (time2) matchString += " " + time2;
    if (increment2) matchString += " " + increment2;
    matchString += rated ? " r" : " u";
    if (typeof wild !== "undefined") matchString += " " + wild;
    if (color) matchString += " " + color;
    this._sendRawData(matchString + "\n");
  }

  move(move) {
    this._sendRawData(move); // TODO: We should probably validate this as an actual move, or clients will be able to send whatever they damn well please with this!
  }

  _sendRawData(data) {
    this.socket.write(";" + data + "\n");

    //this.socket.write(";xt uiuxtest1: " + data + "\n");
  }

  processPackets(packets) {
    log.debug("LegacyUser::processPackets", { packets: packets });
    const self = this;
    packets.level2Packets.forEach(function(p) {
      const p2 = LegacyUserConnection.parseLevel2(p);

      log.debug("processPackets, parsed level 2", { parsed: p2 });
      const l2value = parseInt(p2.shift());
      switch (l2value) {
        case L2.WHO_AM_I /* who_am_i */:
          self.socket.write(";messages\n");
          self.socket.write(";finger\n");
          //self.socket.write(";fol *\n");
          const user = Meteor.user();
          //
          // Fix the case on our username if everything is kosher except for the case
          if (
            !!user &&
            !!user.profile &&
            !!user.profile.legacy &&
            p2[0] !== user.profile.legacy.username &&
            p2[0].toLocaleLowerCase() ===
              user.profile.legacy.username.toLocaleLowerCase()
          ) {
            Meteor.users.update(
              { _id: Meteor.userId() },
              { $set: { "profile.legacy.username": p2[0] } }
            );
          }
          break;
        case L2.MATCH:
          //
          GameRequests.addLegacyMatchReques(
            p2[0],
            parseInt(p2[1]),
            p2[2] === "1",
            p2[3],
            p2[4],
            parseInt(p2[5]),
            p2[6] === "1",
            p2[7],
            parseInt(p2[8]),
            p2[9],
            p2[10] === "1",
            p2[11] === "1",
            parseInt(p2[12]),
            parseInt(p2[13]),
            parseInt(p2[14]),
            parseInt(p2[15]),
            p2[16],
            parseInt(p2[17])
          );
          break;
        case L2.MATCH_REMOVED:
          //challenger-name receiver-name ^Y{Explanation string^Y}
          GameRequests.removeLegacyMatchRequest.apply(null, p2);
          break;
        case L2.MUGSHOT:
          // (Player URL gamenumber)
          if (p2[0] === "W" || p2[0] === "B") return;
          legacyUsers.update({ username: p2[0] }, { $set: { mugshot: p2[1] } });
          break;
        case L2.MSEC:
          Game.updateClock(
            Meteor.user(),
            p2[0],
            p2[1].toLowerCase(),
            parseInt(p2[2])
          );
          break;
        case L2.LOGIN_FAILED /* login_failed */:
          ClientMessages.sendMessageToClient(
            Meteor.user(),
            "LEGACY_LOGIN",
            "LOGIN_FAILED_" + p2[0]
          );
          break;
        case L2.MESSAGELIST_ITEM:
          //incomingMessage(parseInt(p2[1]), p2[2], p2[3], p2[4], p2[5]);
          // index, from, time, date, message
          break;
        case L2.SEND_MOVES:
          Game.saveLegacyMove(Meteor.user(), p2[0], p2[1]);
          break;
        case L2.PLAYER_ARRIVED:
          let x = 0;
          const legacy_player = {
            username: p2[x++],
            ratings: {}
          };
          for (let r = 0; r < sorted_legacy_ratings.length; r++) {
            const value = sorted_legacy_ratings[r];
            legacy_player.ratings[legacy_ratings_on_login[value]] = {
              rating: p2[x++],
              established: p2[x++] === "2"
            };
          }
          legacy_player.titles = p2[x++].split(" ");
          legacy_player.open = p2[x++] === "1";
          legacy_player.state = p2[x++];
          legacy_player.game_id = p2[x];
          legacyUsers.upsert({ username: p2[0] }, { $set: legacy_player });
          break;
        case L2.PLAYER_LEFT:
          legacyUsers.remove({ username: p2[0] });
          break;
        case L2.SEEK:
          GameRequests.addLegacyGameSeek(
            parseInt(p2[0]),
            p2[1],
            p2[2],
            parseInt(p2[3]),
            parseInt(p2[4]),
            parseInt(p2[5]),
            p2[6],
            parseInt(p2[7]),
            parseInt(p2[8]),
            p2[9] === "1",
            p2[10],
            parseInt(p2[11]),
            parseInt(p2[12]),
            p2[13] === "1",
            p2[14]
          );
          break;
        case L2.SEEK_REMOVED:
          GameRequests.removeLegacySeek(parseInt(p2[0]));
          break;
        case L2.STARTED_OBSERVING:
        case L2.MY_GAME_STARTED:
          // TODO: So, I'm discovering that some of these I'm adjusting here in the case, and some I'm just calling whatever.apply with the array, and doing the work there. Pick one and stick with it.
          // TODO: Do we want MY_GAME_STARTED, or GAME_STARTED?
          const white = {
            username: p2[1],
            rating: p2[12]
          };
          const black = {
            username: p2[2],
            rating: p2[13]
          };

          if (self.user.profile.legacy.username === p2[1]) {
            white._id = self.user._id;
          } else if (self.user.profile.legacy.username === p2[2]) {
            black._id = self.user._id;
          } else
            throw new Meteor.Error(
              "Unable to figure out which player we are in this game"
            );
          Game.startLegacyGame(
            white,
            black,
            p2[6],
            p2[7],
            p2[8],
            p2[9],
            p2[5],
            p2[3],
            p2[0],
            "started"
          );
          break;
        case L2.MY_GAME_CHANGE:
          // Mongo.update - Prerak
          break;
        case L2.MY_GAME_ENDED:
          // Mongo.update - Prerak
          break;
        case L2.MY_GAME_RESULT:
          // Mongo.update - Prerak
          break;
        case L2.MOVE_LIST:
          //const game_id = p2.shift();
          //const asterisk = p2.shift();
          // p2 are all moves from here on
          p2.forEach(move => {
            let mm = move.split(" ");
            //   addMoves(p2[0], mm[0]);
          });
          //25 144 * {e4 e2e4 0 61}{e6 e7e6 0 61}{c3 c2c3 0 62}{d5 d7d5 1 61}{Bd3 f1d3 0 63}{Nf6 g8f6 1 62}{e5 e4e5 0 64}{Nfd7 f6d7 1 62}{Qh5 d1h5 0 65}{a6 a7a6 1 62}{b3 b2b3 0 66}{c5 c7c5 1 63}{f4 f2f4 0 66}{Nc6 b8c6 1 63}{Nf3 g1f3 0 67}{g6 g7g6 1 62}{Qg5 h5g5 0 68}{Be7 f8e7 1 62}{Qh6 g5h6 0 69}{Bf8 e7f8 1 63}{Qh3 h6h3 0 70}{Bg7 f8g7 1 63}{O-O e1g1c 0 71}{O-O e8g8c 1 63}{Ba3 c1a3 0 72}{b5 b7b5 1 63}{Ng5 f3g5 0 73}{h6 h7h6 1 62}{Nxe6 g5e6p 0 74}{fxe6 f7e6n 1 63}{Qxe6+ h3e6p 0 75}{Rf7 f8f7 2 62}{Qxc6 e6c6n 0 75}{Rb8 a8b8 4 59}{Bxg6 d3g6p 0 76}{Nf8 d7f8 5 55}{Bxf7+ g6f7r 0 77}{Kxf7 g8f7b 1 55}{Bxc5 a3c5p 0 78}{Bf5 c8f5 2 54}{Qxa6 c6a6p 0 79}{Ne6 f8e6 2 53}{Bd6 c5d6 0 80}{Qb6+ d8b6 3 51}{Qxb6 a6b6q 0 81}{Rxb6 b8b6q 1 51}{Na3 b1a3 0 82}{h5 h6h5 1 51}{Rf3 f1f3 0 83}{Bf8 g7f8 1 51}{Bxf8 d6f8b 0 84}{Kxf8 f7f8b 1 51}{d3 d2d3 0 84}{b4 b5b4 1 51}{cxb4 c3b4p 0 85}{Rxb4 b6b4p 1 51}{g3 g2g3 0 86}{Ke7 f8e7 5 47}{Rb1 a1b1 0 87}{Kd7 e7d7 1 47}{Nc2 a3c2 0 88}{Rb7 b4b7 1 46}{a3 a2a3 0 89}{Rc7 b7c7 1 46}{Nb4 c2b4 0 90}{d4 d5d4 2 45}{Nd5 b4d5 0 91}{Rc2 c7c2 1 45}{Nf6+ d5f6 0 91}{Kd8 d7d8 2 44}{Nxh5 f6h5p 0 92}{Bg4 f5g4 2 43}{Rf2 f3f2 0 93}{Rxf2 c2f2r 2 43}{Kxf2 g1f2r 0 94}{Bxh5 g4h5n 1 43}{b4 b3b4 0 95}{Bg6 h5g6 2 42}{Rb3 b1b3 0 96}{Bf5 g6f5 1 42}{h4 h2h4 0 97}{Bg4 f5g4 1 41}{a4 a3a4 0 98}{Kc7 d8c7 1 41}{Rb1 b3b1 0 99}{Kb6 c7b6 1 42}{Rb2 b1b2 0 100}{Nc7 e6c7 2 41}{Rb1 b2b1 0 100}{Nd5 c7d5 1 41}{Rb3 b1b3 0 101}{Nc3 d5c3 1 41}{Ra3 b3a3 0 102}{Bd7 g4d7 3 40}{a5+ a4a5 0 103}{Ka6 b6a6 1 40}{Ke1 f2e1 0 104}{Bg4 d7g4 1 39}{Rb3 a3b3 0 105}{Nb5 c3b5 1 39}{Kf2 e1f2 0 106}{Nc3 b5c3 5 35}{Ke1 f2e1 0 107}{Kb5 a6b5 1 35}{Kf2 e1f2 0 108}{Nd5 c3d5 1 35}{Rb2 b3b2 0 109}{Bf5 g4f5 5 32}{a6 a5a6 0 109}{Kxa6 b5a6p 1 31}{b5+ b4b5 0 110}{Kb6 a6b6 1 32}{Rd2 b2d2 0 111}{Bg4 f5g4 3 30}{Kg1 f2g1 0 112}{Nb4 d5b4 1 30}{Kh2 g1h2 0 113}{Kxb5 b6b5p 1 29}{h5 h4h5 0 114}{Bxh5 g4h5p 1 29}{f5 f4f5 0 115}{Bg4 h5g4 1 29}{f6 f5f6 0 116}{Be6 g4e6 1 29}{Kg1 h2g1 0 117}{Kc5 b5c5 1 29}{g4 g3g4 0 117}{Nd5 b4d5 2 28}{Rc2+ d2c2 0 118}{Kb6 c5b6 2 27}{Rb2+ c2b2 0 119}{Kc6 b6c6 1 27}{g5 g4g5 0 120}{Nf4 d5f4 1 27}{Kh2 g1h2 0 121}{Bf7 e6f7 4 24}{Rc2+ b2c2 0 122}{Kd7 c6d7 1 24}{Kg3 h2g3 1 122}{Ng6 f4g6 2 23}{Re2 c2e2 0 123}{Ke6 d7e6 1 23}{Kh2 g3h2 0 124}{Nxe5 g6e5p 2 22}{Kg3 h2g3 0 125}{Kf5 e6f5 1 23}{Re4 e2e4 0 126}{Nc6 e5c6 2 21}{Kh4 g3h4 0 127}"}
          break;
        // I20190106-22:35:53.595(-7)?                      =["25","144","*","e4 e2e4 0 61","e6 e7e6 0 61","c3 c2c3 0 62","d5 d7d5 1 61","Bd3 f1d3 0 63","Nf6 g8f6 1 62","e5 e4e5 0 64","Nfd7 f6d7 1 62","Qh5 d1h5 0 65","a6 a7a6 1 62","b3 b2b3 0 66","c5 c7c5 1 63","f4 f2f4 0 66","Nc6 b8c6 1 63","Nf3 g1f3 0 67","g6 g7g6 1 62","Qg5 h5g5 0 68","Be7 f8e7 1 62","Qh6 g5h6 0 69","Bf8 e7f8 1 63","Qh3 h6h3 0 70","Bg7 f8g7 1 63","O-O e1g1c 0 71","O-O e8g8c 1 63","Ba3 c1a3 0 72","b5 b7b5 1 63","Ng5 f3g5 0 73","h6 h7h6 1 62","Nxe6 g5e6p 0 74","fxe6 f7e6n 1 63","Qxe6+ h3e6p 0 75","Rf7 f8f7 2 62","Qxc6 e6c6n 0 75","Rb8 a8b8 4 59","Bxg6 d3g6p 0 76","Nf8 d7f8 5 55","Bxf7+ g6f7r 0 77","Kxf7 g8f7b 1 55","Bxc5 a3c5p 0 78","Bf5 c8f5 2 54","Qxa6 c6a6p 0 79","Ne6 f8e6 2 53","Bd6 c5d6 0 80","Qb6+ d8b6 3 51","Qxb6 a6b6q 0 81","Rxb6 b8b6q 1 51","Na3 b1a3 0 82","h5 h6h5 1 51","Rf3 f1f3 0 83","Bf8 g7f8 1 51","Bxf8 d6f8b 0 84","Kxf8 f7f8b 1 51","d3 d2d3 0 84","b4 b5b4 1 51","cxb4 c3b4p 0 85","Rxb4 b6b4p 1 51","g3 g2g3 0 86","Ke7 f8e7 5 47","Rb1 a1b1 0 87","Kd7 e7d7 1 47","Nc2 a3c2 0 88","Rb7 b4b7 1 46","a3 a2a3 0 89","Rc7 b7c7 1 46","Nb4 c2b4 0 90","d4 d5d4 2 45","Nd5 b4d5 0 91","Rc2 c7c2 1 45","Nf6+ d5f6 0 91","Kd8 d7d8 2 44","Nxh5 f6h5p 0 92","Bg4 f5g4 2 43","Rf2 f3f2 0 93","Rxf2 c2f2r 2 43","Kxf2 g1f2r 0 94","Bxh5 g4h5n 1 43","b4 b3b4 0 95","Bg6 h5g6 2 42","Rb3 b1b3 0 96","Bf5 g6f5 1 42","h4 h2h4 0 97","Bg4 f5g4 1 41","a4 a3a4 0 98","Kc7 d8c7 1 41","Rb1 b3b1 0 99","Kb6 c7b6 1 42","Rb2 b1b2 0 100","Nc7 e6c7 2 41","Rb1 b2b1 0 100","Nd5 c7d5 1 41","Rb3 b1b3 0 101","Nc3 d5c3 1 41","Ra3 b3a3 0 102","Bd7 g4d7 3 40","a5+ a4a5 0 103","Ka6 b6a6 1 40","Ke1 f2e1 0 104","Bg4 d7g4 1 39","Rb3 a3b3 0 105","Nb5 c3b5 1 39","Kf2 e1f2 0 106","Nc3 b5c3 5 35","Ke1 f2e1 0 107","Kb5 a6b5 1 35","Kf2 e1f2 0 108","Nd5 c3d5 1 35","Rb2 b3b2 0 109","Bf5 g4f5 5 32","a6 a5a6 0 109","Kxa6 b5a6p 1 31","b5+ b4b5 0 110","Kb6 a6b6 1 32","Rd2 b2d2 0 111","Bg4 f5g4 3 30","Kg1 f2g1 0 112","Nb4 d5b4 1 30","Kh2 g1h2 0 113","Kxb5 b6b5p 1 29","h5 h4h5 0 114","Bxh5 g4h5p 1 29","f5 f4f5 0 115","Bg4 h5g4 1 29","f6 f5f6 0 116","Be6 g4e6 1 29","Kg1 h2g1 0 117","Kc5 b5c5 1 29","g4 g3g4 0 117","Nd5 b4d5 2 28","Rc2+ d2c2 0 118","Kb6 c5b6 2 27","Rb2+ c2b2 0 119","Kc6 b6c6 1 27","g5 g4g5 0 120","Nf4 d5f4 1 27","Kh2 g1h2 0 121","Bf7 e6f7 4 24","Rc2+ b2c2 0 122","Kd7 c6d7 1 24","Kg3 h2g3 1 122","Ng6 f4g6 2 23","Re2 c2e2 0 123","Ke6 d7e6 1 23","Kh2 g3h2 0 124","Nxe5 g6e5p 2 22","Kg3 h2g3 0 125","Kf5 e6f5 1 23","Re4 e2e4 0 126","Nc6 e5c6 2 21","Kh4 g3h4 0 127"]
        case L2.TITLES:
          const titles = p2[1].split(" ");
          legacyUsers.upsert({ username: p2[0] }, { $set: { titles: titles } });
          break;
        case L2.STATE:
          legacyUsers.upsert(
            { username: p2[0] },
            { $set: { state: p2[1], game_id: p2[2] } }
          );
          break;
        case L2.OPEN:
          legacyUsers.upsert(
            { username: p2[0] },
            { $set: { open: p2[1] === "1" } }
          );
          break;
        case L2.BULLET:
        case L2.BLITZ:
        case L2.STANDARD:
        case L2.WILD:
        case L2.BUGHOUSE:
        case L2.LOSERS:
        case L2.CRAZYHOUSE:
        case L2.FIVEMINUTE:
        case L2.ONEMINUTE:
        case L2.CORRESPONDENCE_RATING:
        case L2.FIFTEENMINUTE:
        case L2.THREEMINUTE:
        case L2.FORTYFIVEMINUTE:
        case L2.CHESS960:
          const ratingField =
            "ratings." + legacy_ratings_on_login[l2value] + ".rating";
          const establishedField =
            "ratings." + legacy_ratings_on_login[l2value] + ".established";
          const set = {};
          set[ratingField] = p2[1];
          set[establishedField] = p2[2] === "2";
          legacyUsers.upsert({ username: p2[0] }, { $set: set });
          break;
        default:
          log.error("Unknown packet: " + JSON.stringify(p));
          break;
      }
    });
  }

  static parseLevel2(packet) {
    /*
        --- The level 1 stuff ... we will deal with that later right now --
        TODO: Do this later
        this.l1PacketData = new String[ours];
        for (int x = 0; x < ours; x++) {
            l1PacketData[x] = level1Packets.get(x);
        }
        this.l1key = pl1key;
        this.packet = ppacket;
*/
    let ctrl = false;
    let currentparm = "";
    let state = IN_BETWEEN;
    let parms = [];

    for (let x = 0; x < packet.packet.length; x++) {
      let by = packet.packet.charAt(x);
      switch (by) {
        case CONTROL_Y: // ^Y
          ctrl = true;
          break;
        case "{":
          if (ctrl && state === IN_BETWEEN) {
            state = IN_CONTROL_BRACKETS_PARM;
          } else if (state === IN_BETWEEN) {
            state = IN_BRACKETS_PARM;
          } else if (ctrl) {
            currentparm += String.fromCharCode(CONTROL_Y);
            currentparm += "{";
          } else {
            currentparm += "{";
          }
          ctrl = false;
          break;
        case "}":
          if (
            (state === IN_CONTROL_BRACKETS_PARM && ctrl) ||
            state === IN_BRACKETS_PARM
          ) {
            parms.push(currentparm);
            currentparm = "";
            state = IN_BETWEEN;
          } else if (ctrl) {
            currentparm += String.fromCharCode(CONTROL_Y);
            currentparm += "}";
          } else {
            currentparm += "}";
          }
          ctrl = false;
          break;
        case " ":
          if (ctrl) {
            ctrl = false;
            currentparm += String.fromCharCode(CONTROL_Y);
          }
          if (state > IN_SIMPLE_PARM) {
            currentparm += " ";
          } else if (state === IN_SIMPLE_PARM) {
            parms.push(currentparm);
            currentparm = "";
            state = IN_BETWEEN;
          }
          break;
        default:
          if (ctrl) {
            ctrl = false;
            currentparm += String.fromCharCode(CONTROL_Y);
          }
          currentparm += by;
          if (state === IN_BETWEEN) {
            state = IN_SIMPLE_PARM;
          }
          break;
      }
    }

    if (currentparm.length !== 0) {
      parms.push(currentparm);
    }

    return parms;
  }
}

const LegacyUser = {
  find: function(userId) {
    return legacy_user_map[userId];
  },
  /**
   *
   * @param user
   */
  // TODO: Make sure they aren't already logged in
  login: function(user) {
    if (
      !Roles.userIsInRole(user, "legacy_login") ||
      !user.profile ||
      !user.profile.legacy ||
      !user.profile.legacy.username ||
      !user.profile.legacy.password ||
      !user.profile.legacy.autologin
    ) {
      log.debug("Not legacy logging in", null, user._id);
      throw new Meteor.Error(
        "Unable to login to the legacy server - Insufficient information in user record or user not authorized: " +
          user._id
      );
    }
    legacy_user_map[user._id] = new LegacyUserConnection(user);
    legacy_user_map[user._id].login();
  },
  /**
   *
   * @param userId
   */
  logout: function(userId) {
    const lu = legacy_user_map[userId];
    if (lu) {
      lu.logout();
      delete lu[userId];
    } /*else
      throw new Meteor.Error(
        "Unable to find legacy connection for " + userId + " to logout from"
      );*/
  }
};

export { LegacyUser };
