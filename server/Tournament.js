import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Roles } from "meteor/alanning:roles";
import { check } from "meteor/check";

export class Tourney {
  constructor(name, scope, nodes) {
    this.name = name;
    this.scope = scope;
    this.nodes = nodes || [];
  }

  save = function() {
    Game.TournamentCollection.insert({ name: this.name, scope: this.scope, nodes: this.nodes });
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

  modifyScope = function(message_identifier, scope) {
    // const user = Meteor.user();
    // if (!this.isAuthorized(user, "tournament_write", scope)) {
    //   throw new ICCMeteorError(
    //     message_identifier,
    //     "Unable to modify tournament",
    //     "this tournament is not in your scope"
    //   );
    // }
    // this.scope = scope;
    // this.save();
  };

  isAuthorized = function(user, role) {
    check(user, Object);
    check(role, String);
    let concat = "";
    for (let index in this.scope) {
      if (index > 0) concat += ".";
      concat += this.scope[index];
      if (Roles.userIsInRole(user, role, concat)) {
        return true;
      }
    }
    return false;
  };
}
