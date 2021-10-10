import { Picker } from "meteor/meteorhacks:picker";
import { Meteor } from "meteor/meteor";
import { Users } from "../collections/users";
import { GameHistory } from "./Game";

//
// Some of this stuff is kind of hard coded. We are going to have to split out the authorization header
// check into a common function, for example.
//
const authorized = Meteor.bindEnvironment((user, selector, callback) => {
  if (
    !Users.isAuthorized(user, "api_export_other_games") ||
    (user._id === selector.user_id && !Users.isAuthorized(user, "api_export_my_games"))
  ) {
    callback("Not authorized");
  } else callback();
});

Picker.route("/api/v1/exportpgn", (params, req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.writeHead(401);
    res.end("Invalid authorization header");
    return;
  }
  const username_and_key = Buffer.from(auth.substring(6), "base64").toString("ascii");
  const [username, key] = username_and_key.split("/");
  if (!username || !key) {
    res.writeHead(401);
    res.end("Invalid authorization header");
    return;
  }
  const user = Users.findAPIKey(key);
  if (!user || user.username !== username || !Users.isAuthorized(user, "api_use")) {
    res.writeHead(401);
    res.end("Not authorized");
    return;
  }
  let json = "";
  req.on("data", (data) => (json += data));
  req.on("end", () => {
    try {
      const selector = JSON.parse(json);
      authorized(user, selector, (err) => {
        if (err) {
          res.writeHead(401);
          res.end(err);
        } else exportpgn(user, selector, res);
      });
    } catch (e) {
      res.writeHead(400);
      res.end(e.message);
    }
  });
});

const game_history_find = Meteor.bindEnvironment((selector, callback) =>
  callback(
    GameHistory.collection.find({
      $or: [{ "white.id": selector.user_id }, { "black.id": selector.user_id }],
    })
  )
);

function exportpgn(user, selector, res) {
  const config = {};
  if (
    selector.audit !== undefined &&
    (Users.isAuthorized(user, "audit_game") ||
      Users.isAuthorized(user, "audit_game", user.isolation_group))
  )
    config.audit = selector.audit;
  if (selector.movetimes !== undefined) config.movetimes = selector.movetimes;
  if (selector.walltimes !== undefined) config.walltimes = selector.walltimes;
  game_history_find(selector, (cursor) => {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Disposition": "attachment; filename=" + selector.user_id + ".pgn",
    });

    let crashed = false;
    cursor.forEach((game) => {
      try {
        if (!crashed) {
          const pgnstring = Game.gameToPgn(game, config);
          res.write(pgnstring);
          res.write("\n");
        }
      } catch (e) {
        crashed = true;
        res.writeHead(401);
        res.end("Error in export: " + e.message);
      }
    });
    res.end();
  });
}
