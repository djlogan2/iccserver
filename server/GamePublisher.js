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
