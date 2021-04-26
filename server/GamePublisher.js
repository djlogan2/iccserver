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
function updateUserType(rec, oldType) {
  const newType = {
    data: { ...oldType.data }
  };

  if ("white" in rec) {
    if (rec.white.id === this.userId) newType.data.color = "white";
    else if (newType.data.color === "white") delete newType.data.color;
  }

  if ("black" in rec) {
    if (rec.black.id === this.userId) newType.data.color = "black";
    else if (newType.data.color === "black") delete newType.data.color;
  }

  if ("tomove" in rec) newType.data.tomove = rec.tomove;
  if ("status" in rec) newType.data.status = rec.status;
  if ("private" in rec) newType.data.private = rec.private;

  const temp = {
    played: newType.status === "playing",
    _private: rec.private || !!oldType.private,
    analysis: false, //TODO: ... not sure how to do arrays yet
    owner: "owner" in rec ? rec.owner === this.userId : !!oldType.owner
  };
  temp.player = temp.played && (newType.data.color === "white" || newType.data.color === "black");
  temp.tomove = !temp.played || !temp.player || newType.data.color === newType.data.tomove;
  temp.observer = !temp.player; // TODO: This isn't true. We need to check the observer array

  if (temp.played && temp.player && !temp.tomove) temp.type = 0;
  else if (temp.played && temp.player && !!temp.tomove) temp.type = 1;
  else if (temp.played && !temp.player) temp.type = 2;
  else if (!temp.played && !temp.private && temp.observer) temp.type = 3;
  else if (!temp.played && temp.private && temp.owner) temp.type = 4;
  else if (!temp.played && temp.private && temp.observer && temp.analysis) temp.type = 5;
  else if (!temp.played && temp.private && temp.observer && !temp.analysis) temp.type = 6;
  else temp.type = 7;

  if (oldType.played !== temp.played) newType.played = temp.played;
  if (oldType.player !== temp.player) newType.player = temp.player;
  if (oldType.tomove !== temp.tomove) newType.tomove = temp.tomove;
  if (oldType.observer !== temp.observer) newType.observer = temp.observer;
  if (oldType.private !== temp.private) newType._private = temp.private;
  if (oldType.analysis !== temp.analysis) newType.analysis = temp.analysis;
  if (oldType.owner !== temp.owner) newType.played = temp.owner;
  if (oldType.type !== temp.type) newType.type = temp.type;

  return newType;
}

const fields = {
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

function getUserFields(oldtype, newtype) {
  const retfields = {
    addedFields: [],
    deletedFields: [],
    authorizedFields: []
  };
  for(const k in fields) {
    if (fields[k].indexOf(newtype) !== -1) {
      retfields.authorizedFields.push(k);
      if(oldtype !== newtype) {
        if(fields[x].indexOf(oldtype) !== -1)
      }
    } else if(oldtype !== newtype) {
      if(fields[k].indexOf())
    }
  }
}

function copyAuthorizedFields(rec, fields) {}

function nullDeletedFields(rec, fields) {}

function addNewFields(rec, fields) {}

function x(id, rec, oldtype) {
  const newtype = updateUserType(rec, oldtype);
  // fieldset: {deletedfields: [], newfields: [], authorizedfields: []}
  const fieldset = getUserFields(oldtype, newtype);
  const newrec = copyAuthorizedFields(rec, fieldset.authorizedFields);
  nullDeletedFields(newrec, fieldset.deletedfields);
  addNewFields(id, newrec, fieldset.newFields);
}

function setflags(old_status, new_status, fields) {
  // let status;
  // let player_color;
  // let game_tomove;
  // let player;
  // let tomove;
  // let examiner;
  // let owner;
  // let analysis;
  // let private;

  if ("status" in fields) {
    new_status.status = fields.status;
    new_status.player = false;
  }

  if ((new_status.status || old_status.status) === "playing") {
    if ("white" in fields && "id" in fields.white.id === this.userId) {
      if (!old_status.player) new_status.player = true;
      if (!old_status.player_color === "white") new_status.player_color = "white";
    } else if ("black" in fields && "id" in fields.black.id === this.userId) {
      if (!old_status.player) new_status.player = true;
      if (!old_status.player_color === "black") new_status.player_color = "black";
    }
    if ("tomove" in fields) {
      new_status.game_tomove = tomove;
      const new_tomove = (new_status.player_color || old_status.player_color) === tomove;
      if (old_status.tomove !== new_tomove) new_status.tomove = new_tomove;
    }
  } else {
    if (!old_status.tomove) new_status.tomove = true;
    if (!!old_status.player_color) new_status.player_color = null;
    if (!!old_status.player) new_status.player = false;
    if ("private" in fields && fields.private !== old_status.private)
      new_status.private = fields.private;
    if (old_status.private || new_status.private) {
      if ("owner" in fields) {
        new_owner = fields.owner === this.userId;
        if (old_status.owner !== new_owner) new_status.owner = new_owner;
      }
    }
  }
}
