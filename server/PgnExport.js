import { Game, GameHistory } from "./Game";
import { Picker } from "meteor/meteorhacks:picker";

Picker.route("/export/pgn/:collection/:_id", function(params, req, res, next) {
  let game;
  
  switch (params.collection) {
    case "game":
      //   fileName = Game.getFileName(params._id);
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
  res.setHeader("content-disposition", "attachment; filename=" + game.title);
  res.setHeader("content-length", game.pgn.length);
  res.write(game.pgn);
  res.end();
});
