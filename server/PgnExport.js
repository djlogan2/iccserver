import { Picker } from "meteor/meteorhacks:picker";
Picker.route("/export/pgn/:collection/:_id", function(params, req, res, next) {
  res.setHeader("content-type", "text/plain");
  res.setHeader("content-disposition", "attachment; filename=" + "x" + ".pgn");
  res.setHeader("content-length", 31);
  res.write("this is where the pgn data goes");
  res.end();
});
