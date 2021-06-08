import Chess from "chess.js";
import { EcoSchema } from "../../../server/EcoSchema";
import { Mongo } from "meteor/mongo";

export default function firstRunEcocodes() {
  if (!global.ecoCollection) initialLoad();
}

function initialLoad() {
  if (!global.ecoCollection) {
    global.ecoCollection = new Mongo.Collection("ecocodes");
    global.ecoCollection.attachSchema(EcoSchema);
  }
  const content = Assets.getText("eco.txt");
  const variations = { cmi: 0, movelist: [] };
  let chess = Chess.Chess();

  content.split("\n").forEach((line, line_number) => {
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
        variations.cmi = 0;
        moves.forEach((move) => {
          chess.move(move);
          global.Game.addMoveToMoveList(variations, move);
        });
        let fen = chess.fen();
        chess.reset();
        variations.movelist[variations.cmi].fen = fen;
        variations.movelist[variations.cmi].eco = eco;
        variations.movelist[variations.cmi].name = name;
        variations.movelist[variations.cmi].wild = 0;
      } catch (e) {
        throw new Meteor.Error(
          "Unable to load ECO codes",
          "Line " + line_number + " has an error: " + e.toString()
        );
      }
    }
  });

  variations.movelist.forEach((m) => {
    delete m.current;
    delete m.variations;
    delete m.prev;
    delete m.move;
    delete m.smith;
    if (m.fen) {
      global.ecoCollection.insert(m);
    }
  });
  delete variations.cmi;

  // global.Game.ecoCollection.insert(variations);
  // return variations;
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
