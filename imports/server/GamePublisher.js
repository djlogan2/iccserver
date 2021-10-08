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

const fields = {
  _id: [0, 1, 2, 3, 4, 5, 6, 7],
  analysis: [4],
  arrows: [2, 3, 4, 5, 6],
  black: [0, 1, 2, 3, 4, 5, 6, 7],
  circles: [2, 3, 4, 5, 6],
  clocks: [0, 1, 2, 3, 4, 5, 6, 7],
  computer_variations: [2, 3, 4, 5],
  deny_chat: [4, 5, 6],
  deny_requests: [4],
  examiners: [3, 4, 5, 6],
  fen: [0, 1, 2, 3, 4, 5, 6],
  // isolation_group: [0, 1, 2, 3, 4, 5, 6, 7],
  legacy_game_id: [0, 1, 2, 3, 4, 5, 6],
  legacy_game_number: [0, 1, 2, 3, 4, 5, 6],
  observers: [0, 1, 2, 3, 4, 5, 6],
  owner: [4],
  pending: [0, 1, 2, 3, 4, 5, 6],
  premove: [0, 2],
  private: [4],
  rated: [0, 1, 2, 3, 4, 5, 6, 7],
  rating_type: [0, 1, 2, 3, 4, 5, 6, 7],
  requestors: [4],
  result: [3, 4, 5, 6, 7],
  skill_level: [0, 1, 2, 3, 4, 5, 6, 7],
  startingfen: [0, 1, 2, 3, 4, 5, 6],
  startTime: [0, 1, 2, 3, 4, 5, 6, 7],
  status: [0, 1, 2, 3, 4, 5, 6, 7],
  status2: [3, 4, 5, 6, 7],
  tags: [3, 4, 5, 6],
  tomove: [0, 1, 2, 3, 4, 5, 6, 7],
  variations: [0, 1, 2, 3, 4, 5, 6],
  white: [0, 1, 2, 3, 4, 5, 6, 7],
  wild: [0, 1, 2, 3, 4, 5, 6, 7],
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
          this.newType.type = 1;
        } else {
          this.newType.type = 0;
        }
      } else {
        if (this.newType.observer) {
          this.newType.type = 2;
        } else {
          this.newType.type = 7;
        }
      }
    } else {
      if (this.newType.private) {
        if (this.newType.owner) {
          this.newType.type = 4;
        } else {
          if (this.newType.observer) {
            if (this.newType.analysis) {
              this.newType.type = 5;
            } else {
              this.newType.type = 6;
            }
          } else {
            this.newType.type = 7;
          }
        }
      } else {
        if (this.newType.observer) {
          this.newType.type = 3;
        } else {
          this.newType.type = 7;
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
