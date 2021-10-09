import { GameHistory } from "./Game";
import { Picker } from "meteor/meteorhacks:picker";

Picker.route("/export/pgn/:collection/:_id", function (params, req, res) {
  let pgnstring;

  switch (params.collection) {
    case "game":
      pgnstring = Game.exportToPGN(params._id);
      break;
    case "history":
      pgnstring = GameHistory.exportToPGN(params._id);
      break;
    default:
      res.statusCode = 400;
      res.statusMessage = "Invalid collection";
      res.end("Invalid collection");
      return;
  }
  if (!pgnstring) {
    res.statusCode = 400;
    res.statusMessage = "Invalid ID";
    res.end("Invalid ID");
    return;
  }

  res.setHeader("content-type", "text/plain");
  res.setHeader("content-disposition", "attachment; filename=" + params._id + ".pgn");
  res.setHeader("content-length", pgnstring.length);
  res.write(pgnstring);
  res.end();
});
