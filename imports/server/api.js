import date from "date-and-time";
import { Picker } from "meteor/meteorhacks:picker";
import exporter from "@chessclub.com/chesspgn/app/exporter";
import { Meteor } from "meteor/meteor";
import { Users } from "../collections/users";
import { GameHistory } from "../../server/Game";

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
  const username_and_key = new Buffer(auth.substring(6), "base64").toString("ascii");
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
        } else exportpgn(selector, res);
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

function exportpgn(selector, res) {
  game_history_find(selector, (cursor) => {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Disposition": "attachment; filename=" + selector.user_id + ".pgn",
    });

    cursor.forEach((game) => {
      const magicseven = {
        Event: "",
        Site: "",
        Date: date.format(game.startTime, "YYYY-MM-DD"),
        Time: date.format(game.startTime, "HH:mm:ss"),
        White: game.white.name,
        Black: game.black.name,
        Result: game.result,
      };
      const gametags = game.tags || {};
      const tags = { ...magicseven, ...gametags };

      const pgnstring = exporter(tags, game.variations.movelist);
      res.write(pgnstring);
      res.write("\n");
    });
    res.end();
  });
}
