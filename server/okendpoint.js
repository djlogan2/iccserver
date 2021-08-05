import { Picker } from "meteor/meteorhacks:picker";

Picker.route("/ok", function(params, req, res) {
  res.end('{ok: "true"}');
});
