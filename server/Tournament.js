import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Roles } from "meteor/alanning:roles";
import { check } from "meteor/check";

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
    check(message_identifier, String);
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

  modifyScope = function(message_identifier, scope) {};

  isAuthorized = function(user, role, scope) {
    check(user, Object);
    check(role, String);
    scope = scope || [];
    check(scope, Array);
    let concat = "";
    for (let index in this.scope) {
      if (index > 0) concat += ".";
      concat += this.scope[index];
      if (Roles.userIsInRole(user, role, concat)) {
        if (!(scope === [])) {
          return true;
        } else {
          concat = "";
          for (let index2 in scope) {
            if (index2 > 0) concat += ".";
            concat += scope[index2];
            if (Roles.userIsInRole(user, role, concat)) return true;
          }
          return false;
        }
      }
    }
    return false;
  };
}
