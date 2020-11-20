import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

export class Tourney {
  constructor(name, scope, nodes) {
    this.name = name;
    this.scope = scope;
    this.nodes = [] || nodes;
  }

  save = function() {
    Game.TournamentCollection.insert(
      { name: this.name, scope: this.scope },
      { $insert: { name: this.name, scope: this.scope, nodes: this.nodes } }
    );
  };

  delete = function(message_identifier) {
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
    Game.TournamentCollection.remove({ name: this.name, scope: this.scope });
  };

  validate = function() {};
}
