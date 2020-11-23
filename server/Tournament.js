import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
// TODO: MRD: Don't use Roles. Use "Users". Delete this import, add the Users import, and make the change to isAuthorized
import { Roles } from "meteor/alanning:roles";
import { check } from "meteor/check";

export class Tourney {
  constructor(name, scope, nodes) {
    this.name = name;
    this.scope = scope;
    this.nodes = nodes || [];
  }

  // TODO: MRD: Don't use save = function()
  //       Just use the simple save() {...}
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
    // TODO: MRD: Um, why are you putting TournamentCollection in "Game"? Just put it here in this file.
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
      // TODO: MRD: This is fine. Nothing wrong with it. There are three other ways to do it also (at least):
      // 1. if(!!index) concat += ".";
      // 2. concat += index > 0 ? "." : "";
      // 3. concat += !!index ? "." : "";
      // Also, how I like to do it. No if statement, just an assignment. Slightly more performant:
      //   let dot = "";
      //   for( ... whatever ...) {
      //     result += dot + thing;
      //     dot = ".";
      //   }
      // TODO: MRD: Just delete the above, this was just FYI
      if (index > 0) concat += ".";
      concat += this.scope[index];
      if (Roles.userIsInRole(user, role, concat)) {
        return true;
      }
    }
    return false;
  };
}
