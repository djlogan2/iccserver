import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Roles } from "meteor/alanning:roles";

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

  modifyScope = function() {};

  isAuthorized = function(user, role) {
    const branches = this.scope;
    const userscope = Roles.getScopesForUser(user);
    for (let branchIndex in branches) {
      let scopeInBranch = false;
      let scopebranch = branches[branchIndex].split(".");
      for (let scopeindex in scopebranch) {
        let tourneyelement = scopebranch[scopeindex];
        for (let userscopeindex in userscope) {
          let userelement = userscope[userscopeindex];
          if (userelement === tourneyelement) scopeInBranch = true;
          if (scopeInBranch && tourneyelement === role) return true;
        }
      }
    }
    return false;
  };
}
