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
class GamePublisher {
  constructor(collection) {
    this.collection = collection;
    this.fields = {
      analysis: [4, 5],
      arrows: [2, 3, 4, 5, 6],
      black: [0, 1, 2, 3, 4, 5, 6, 7],
      circles: [2, 3, 4, 5, 6],
      clocks: [0, 1, 2, 3, 4, 5, 6, 7],
      computer_variations: [2, 3, 4],
      deny_chat: [4, 5, 6],
      deny_requests: [4, 5, 6],
      examiners: [3, 4, 5, 6],
      fen: [0, 1, 2, 3, 4, 5, 6],
      isolation_group: [0, 1, 2, 3, 4, 5, 6, 7],
      legacy_game_id: [0, 1, 2, 3, 4, 5, 6],
      legacy_game_number: [0, 1, 2, 3, 4, 5, 6],
      observers: [0, 1, 2, 3, 4, 5, 6],
      owner: [4],
      pending: [0, 1, 2, 3, 4, 5, 6],
      premove: [1, 2],
      private: [4],
      rated: [0, 1, 2, 3, 4, 5, 6, 7],
      rating_type: [0, 1, 2, 3, 4, 5, 6, 7],
      requestors: [4],
      result: [3, 4, 5, 6, 7],
      skill_level: [0, 1, 2, 3, 4, 5, 6, 7],
      startingfen: [0, 1, 2, 3, 4, 5, 6],
      startTime: [0, 1, 2, 3, 4, 5, 6, 7],
      status: [3, 4, 5, 6, 7],
      status2: [3, 4, 5, 6, 7],
      tags: [3, 4, 5, 6],
      tomove: [0, 1, 2, 3, 4, 5, 6, 7],
      variations: [0, 1, 2, 3, 4, 5, 6],
      white: [0, 1, 2, 3, 4, 5, 6, 7],
      wild: [0, 1, 2, 3, 4, 5, 6, 7]
    };
    this.oldType = {};
    this.newType = {};
  }

  updateUserType(rec) {
    this.oldType = {...this.this.newType};

    this.newType = {
      data: { ...this.oldType.data }
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
    if ("private" in rec) this.newType.data.private = rec.private;

    const temp = {
      played: this.newType.status === "playing",
      _private: rec.private || !!this.oldType.private,
      analysis: false, //TODO: ... not sure how to do arrays yet
      owner: "owner" in rec ? rec.owner === this.userId : !!this.oldType.owner
    };
    temp.player = temp.played && (this.newType.data.color === "white" || this.newType.data.color === "black");
    temp.tomove = !temp.played || !temp.player || this.newType.data.color === this.newType.data.tomove;
    temp.observer = !temp.player; // TODO: This isn't true. We need to check the observer array

    if (temp.played && temp.player && !temp.tomove) temp.type = 0;
    else if (temp.played && temp.player && !!temp.tomove) temp.type = 1;
    else if (temp.played && !temp.player) temp.type = 2;
    else if (!temp.played && !temp.private && temp.observer) temp.type = 3;
    else if (!temp.played && temp.private && temp.owner) temp.type = 4;
    else if (!temp.played && temp.private && temp.observer && temp.analysis) temp.type = 5;
    else if (!temp.played && temp.private && temp.observer && !temp.analysis) temp.type = 6;
    else temp.type = 7;

    if (this.oldType.played !== temp.played) this.newType.played = temp.played;
    if (this.oldType.player !== temp.player) this.newType.player = temp.player;
    if (this.oldType.tomove !== temp.tomove) this.newType.tomove = temp.tomove;
    if (this.oldType.observer !== temp.observer) this.newType.observer = temp.observer;
    if (this.oldType.private !== temp.private) this.newType._private = temp.private;
    if (this.oldType.analysis !== temp.analysis) this.newType.analysis = temp.analysis;
    if (this.oldType.owner !== temp.owner) this.newType.played = temp.owner;
    if (this.oldType.type !== temp.type) this.newType.type = temp.type;

  }

  getUserFields() {
    this.retfields = {
      addedFields: [],
      deletedFields: [],
      authorizedFields: []
    };
    for (const k in this.fields) {
      if (this.fields[k].indexOf(this.newType) !== -1) {
        this.retfields.authorizedFields.push(k);
        if (oldtype !== this.newType && this.fields[k].indexOf(oldtype) !== -1) {
          this.retfields.addedFields.push(k);
        }
      } else if (
        oldtype !== this.newType &&
        this.fields[k].indexOf(oldtype) !== -1 &&
        this.fields[k].indexOf(this.newType) === -1
      ) {
        this.retfields.deletedFields.push(k);
      }
    }
  }

  copyAuthorizedFields(rec, fields) {
    const newrec = {};
    for (const k in rec) if (fields.authorizedFields.indexOf(k) !== -1) newrec[k] = rec[k];
    return newrec;
  }

  nullDeletedFields(rec, fields) {
    const retrec = { ...rec };
    for (const k in fields.deletedFields) retrec[k] = null;
    return retrec;
  }

  addNewFields(id, rec, fields) {
    let fromDatabase = {};
    let doit = false;
    if (!fields || !fields.addedFields || !fields.addedFields.length) return;
    for (const k in fields.addedFields) {
      if (!(k in rec)) {
        fromDatabase[k] = 1;
        doit = true;
      }
    }
    if (doit) return { ...rec, ...this.collection.findOne({ _id: id }, { fields: fromDatabase }) };
    else return rec;
  }

  getUpdatedRecord(id, rec, oldtype) {
    const this.newType = this.updateUserType(rec, oldtype);
    // fieldset: {deletedfields: [], newfields: [], authorizedfields: []}
    const fieldset = this.getUserFields(oldtype, this.newType);
    let newrec = this.copyAuthorizedFields(rec, fieldset.authorizedFields);
    newrec = this.nullDeletedFields(newrec, fieldset.deletedFields);
    newrec = this.addNewFields(id, newrec, fieldset.addedFields);
  }
}
