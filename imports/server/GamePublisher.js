//{
//  data: {
//    color: "white" or "black" (if playing)
//    tomove: "white" or "black"
//    status: the game status
//  }
//  player: t/f
//  played: t/f
//  tomove: t/f
//  observer: t/f
//  analysis: t/f
//  owner: t/f
//}

import { Logger } from "../../lib/server/Logger";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/GamePublisher_js");

//
// 0: player not to move
// 1: player to move
// 2: observer of played game
// 3: observer of an examined game
// 4: owner of a private game
// 5: private game peon with analysis
// 6: private game peon without analysis
// 7: A nobody
//
const PLAYER_NOT_TO_MOVE = 0;
const PLAYER_TO_MOVE = 1;
const OBSERVER_PLAYED_GAME = 2;
const OBSERVER_EXAMINED_GAME = 3;
const OWNER_PRIVATE_GAME = 4;
const ANALYSIS_PRIVATE_GAME = 5;
const NO_ANALYSIS_PRIVATE_GAME = 6;
const NOBODY = 7;

const fields = {
  _id: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  analysis: [OWNER_PRIVATE_GAME],
  arrows: [
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  black: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  circles: [
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  clocks: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  computer_variations: [
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
  ],
  deny_chat: [OWNER_PRIVATE_GAME, ANALYSIS_PRIVATE_GAME, NO_ANALYSIS_PRIVATE_GAME],
  deny_requests: [OWNER_PRIVATE_GAME],
  examiners: [
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  fen: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  // isolation_group: [PLAYER_NOT_TO_MOVE, PLAYER_TO_MOVE, OBSERVER_PLAYED_GAME, OBSERVER_EXAMINED_GAME, OWNER_PRIVATE_GAME, ANALYSIS_PRIVATE_GAME, NO_ANALYSIS_PRIVATE_GAME, NOBODY],
  legacy_game_id: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  legacy_game_number: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  observers: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  owner: [OWNER_PRIVATE_GAME],
  pending: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  premove: [PLAYER_NOT_TO_MOVE, OBSERVER_PLAYED_GAME],
  private: [OWNER_PRIVATE_GAME],
  rated: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  rating_type: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  requestors: [OWNER_PRIVATE_GAME],
  result: [
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  skill_level: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  startingfen: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  startTime: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  status: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  status2: [
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  tags: [
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  tomove: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  variations: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
  ],
  white: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
  wild: [
    PLAYER_NOT_TO_MOVE,
    PLAYER_TO_MOVE,
    OBSERVER_PLAYED_GAME,
    OBSERVER_EXAMINED_GAME,
    OWNER_PRIVATE_GAME,
    ANALYSIS_PRIVATE_GAME,
    NO_ANALYSIS_PRIVATE_GAME,
    NOBODY,
  ],
};

class GamePublisher {
  constructor(collection, userId) {
    this.collection = collection;
    this.userId = userId;
    this.oldType = {};
    this.newType = {};
    this.authorizedFields = [];
    this.addedFields = [];
    this.deletedFields = [];
  }

  updateUserType(rec) {
    this.oldType = { ...this.newType };

    this.newType = {
      data: { ...this.oldType.data },
    };

    if ("white" in rec) {
      if (rec.white.id === this.userId) this.newType.data.color = "white";
      else if (this.newType.data.color === "white") delete this.newType.data.color;
    }

    if ("black" in rec) {
      if (rec.black.id === this.userId) this.newType.data.color = "black";
      else if (this.newType.data.color === "black") delete this.newType.data.color;
    }

    if ("tomove" in rec) this.newType.data.tomove = rec.tomove;
    if ("status" in rec) this.newType.data.status = rec.status;
    if ("private" in rec) this.newType.private = rec.private;

    this.newType.played = this.newType.data.status === "playing";
    this.newType.private = rec.private || !!this.oldType.private;
    this.newType.analysis = false; //TODO: ... not sure how to do arrays yet
    this.newType.owner = "owner" in rec ? rec.owner === this.userId : !!this.oldType.owner;
    this.newType.player =
      this.newType.played &&
      (this.newType.data.color === "white" || this.newType.data.color === "black");
    this.newType.tomove =
      !this.newType.played ||
      !this.newType.player ||
      this.newType.data.color === this.newType.data.tomove;
    if ("analysis" in rec) {
      this.newType.analysis = rec.analysis.some((an) => an.id === this.userId);
    } else
      this.newType.analysis = this.oldType.analysis === undefined ? true : this.oldType.analysis;
    if ("observers" in rec) {
      this.newType.observer = rec.observers.some((ob) => ob.id === this.userId);
    } else this.newType.observer = this.oldType.observer || false;

    if (this.newType.played) {
      if (this.newType.player) {
        if (this.newType.tomove) {
          this.newType.type = PLAYER_TO_MOVE;
        } else {
          this.newType.type = PLAYER_NOT_TO_MOVE;
        }
      } else {
        if (this.newType.observer) {
          this.newType.type = OBSERVER_PLAYED_GAME;
        } else {
          this.newType.type = NOBODY;
        }
      }
    } else {
      if (this.newType.private) {
        if (this.newType.owner) {
          this.newType.type = OWNER_PRIVATE_GAME;
        } else {
          if (this.newType.observer) {
            if (this.newType.analysis) {
              this.newType.type = ANALYSIS_PRIVATE_GAME;
            } else {
              this.newType.type = NO_ANALYSIS_PRIVATE_GAME;
            }
          } else {
            this.newType.type = NOBODY;
          }
        }
      } else {
        if (this.newType.observer) {
          this.newType.type = OBSERVER_EXAMINED_GAME;
        } else {
          this.newType.type = NOBODY;
        }
      }
    }
  }

  getUserFields() {
    this.authorizedFields = [];
    this.addedFields = [];
    this.deletedFields = [];
    for (const k in fields) {
      if (fields[k].indexOf(this.newType.type) !== -1) {
        this.authorizedFields.push(k);
        if (
          this.oldType.type !== this.newType.type &&
          fields[k].indexOf(this.oldType.type) === -1
        ) {
          this.addedFields.push(k);
        }
      } else if (
        this.oldType.type !== this.newType.type &&
        fields[k].indexOf(this.oldType.type) !== -1 &&
        fields[k].indexOf(this.newType.type) === -1
      ) {
        this.deletedFields.push(k);
      }
    }
  }

  copyAuthorizedFields(rec) {
    const newrec = {};
    for (const k in rec) if (this.authorizedFields.indexOf(k) !== -1) newrec[k] = rec[k];
    return newrec;
  }

  nullDeletedFields(rec) {
    const retrec = { ...rec };
    for (let k = 0; k < this.deletedFields.length; k++) retrec[this.deletedFields[k]] = undefined;
    return retrec;
  }

  addNewFields(id, rec) {
    let fromDatabase = {};
    let doit = false;
    if (!fields || !this.addedFields || !this.addedFields.length) return rec;
    for (let x = 0; x < this.addedFields.length; x++) {
      const k = this.addedFields[x];
      if (!(k in rec)) {
        fromDatabase[k] = 1;
        doit = true;
      }
    }
    return doit
      ? { ...rec, ...this.collection.findOne({ _id: id }, { fields: fromDatabase }) }
      : rec;
  }

  getUpdatedRecord(id, rec) {
    this.updateUserType(rec);
    if (this.oldType.type !== this.newType.type) this.getUserFields();
    let newrec = this.copyAuthorizedFields(rec);
    if (this.oldType.type !== this.newType.type) {
      newrec = this.nullDeletedFields(newrec);
      newrec = this.addNewFields(id, newrec);
    }
    if (!Object.keys(newrec).length) return null;
    else return newrec;
  }
}

export default GamePublisher;
