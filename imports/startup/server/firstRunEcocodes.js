import Chess from "chess.js";
import { EcoSchema } from "../../../server/EcoSchema";
import { Mongo } from "meteor/mongo";
import { EcoCollection } from "../../../server/Game";

export default function firstRunEcocodes() {
  if (!EcoCollection.findOne()) initialLoad();
}

function initialLoad() {
  if (!EcoCollection) {
    EcoCollection = new Mongo.Collection("ecocodes");
    EcoCollection.attachSchema(EcoSchema);
  }
  const content = Assets.getText("eco.txt");
  let chess = Chess.Chess();

  let line_number = 0;
  content.split("\n").forEach((line) => {
    line_number++;
    if (line.trim().length) {
      const pieces = line.split(": ");
      if (pieces.length !== 3)
        throw new Meteor.Error(
          "Unable to load ECO codes",
          "Line " + line_number + " has a syntax error"
        );
      const eco = pieces[0];
      const name = pieces[1];
      try {
        const moves = parseMoves(pieces[2]);
        moves.forEach((move) => {
          chess.move(move);
        });
        let fen = chess.fen();
        chess.reset();
        EcoCollection.insert({ name: name, eco: eco, fen: fen, wild: 0 });
      } catch (e) {
        throw new Meteor.Error(
          "Unable to load ECO codes",
          "Line " + line_number + " has an error: " + e.toString()
        );
      }
    }
  });
}

function trim_whitespace(object) {
  if (!object.move_string || !object.move_string.length) return false;
  object.move_string = object.move_string.trim();
  return true;
}

function trim_move_number(object) {
  if (!object.move_string || !object.move_string.length) return false;
  object.move_sring = object.move_string.replace("\\d+.s*(.*)", "$1");
  return true;
}

function get_move(object) {
  if (!object.move_string || !object.move_string.length) return false;
  const found = object.move_string.match(
    "((([RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](=[RQBN])?)|O-O(?:-O)?)[+#]?)(.*)"
  );
  object.moves.push(found[1]);
  object.move_string = found[5];
  return true;
}

function parseMoves(move_string) {
  const object = {
    moves: [],
    move_string: move_string,
  };
  while (true) {
    if (!trim_whitespace(object)) return object.moves;
    if (!trim_move_number(object)) return object.moves;
    if (!get_move(object)) return object.moves;
    if (!trim_whitespace(object)) return object.moves;
    if (!get_move(object)) return object.moves;
  }
}
