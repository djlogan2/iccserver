import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

export class Tourney {
  constructor(name, scope, nodes) {
    this.name = name;
    this.scope = scope;
    this.nodes = [] || nodes;
  }

  save = function() {
    Game.TournamentCollection.upsert({ name: this.name, scope: this.scope, nodes: this.nodes });
  };

  delete = function(message_identifier) {
    // removes self from dummy collection for now,
    // need to find schema and collection for tourneys
    // Searches by scope + name assumed unique, pulls all fields
    // Throws ICCMeteor error if cannot find record to remove
    const game = Game.TournamentCollection.findOne({ name: this.name, scope: this.scope });
    if (!game) {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove tournament",
        "tournament does not exist"
      );
    }
    Game.TournamentCollection.update({ name: this.name, scope: this.scope }, { $pullAll: 1 });
  };

  validate = function() {
    // So far recursively runs validate on nodes,
    // assuming they are tournament objects, return true if hitting a leaf
    if (this.nodes === []) {
      return false;
    }
    if (!this.nodes) {
      return true;
    } else {
      for (let node in this.nodes) {
        node.validate();
      }
    }
  };
}
