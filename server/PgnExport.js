import { Game, GameHistory } from "./Game";
import { Picker } from "meteor/meteorhacks:picker";

Picker.route("/export/pgn/:collection/:_id/:title", function(params, req, res, next) {
  let game;
  switch (params.collection) {
    case "game":
      game = Game.exportToPGN(params._id);
      break;
    case "history":
      game = GameHistory.exportToPGN(params._id);
      break;
    default:
      res.statusCode = 400;
      res.statusMessage = "Invalid collection";
      res.end("Invalid collection");
      return;
  }

  if (!game) {
    res.statusCode = 400;
    res.statusMessage = "Invalid ID";
    res.end("Invalid ID");
    return;
  }

  res.setHeader("content-type", "text/plain");
  res.setHeader("content-disposition", "attachment; filename=" + params.title);
  res.setHeader("content-length", game.length);
  res.write(game);
  res.end();
});
